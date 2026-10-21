import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { betaVersion, isExpectedBetaManifest } from './release-policy.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(repositoryRoot, 'packages');
const packageDirectories = readdirSync(packageRoot, {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory());
const failures = [];

for (const directory of packageDirectories) {
  const cwd = join(packageRoot, directory.name);
  const manifest = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      shell: process.platform === 'win32',
    }),
  );
  const files = new Set(packed[0]?.files.map((file) => file.path) ?? []);

  if (!isExpectedBetaManifest(manifest))
    failures.push(
      `${manifest.name}: expected public ${betaVersion} on beta tag`,
    );
  if (manifest.license !== 'MIT')
    failures.push(`${manifest.name}: missing MIT SPDX license`);
  for (const required of ['package.json', 'README.md', 'dist/LICENSE']) {
    if (!files.has(required))
      failures.push(`${manifest.name}: missing ${required} from npm tarball`);
  }
  for (const [entryName, target] of Object.entries(manifest.exports ?? {})) {
    for (const key of ['types', 'default']) {
      const path = target[key]?.replace(/^\.\//, '');
      if (!path || !files.has(path))
        failures.push(
          `${manifest.name}: ${entryName} ${key} export missing from tarball`,
        );
    }
  }
  for (const path of files) {
    if (
      /(^|\/)(\.env|AGENTS\.md|CLAUDE\.md|\.codex|\.github)(\/|$)/i.test(path)
    ) {
      failures.push(`${manifest.name}: prohibited tarball entry ${path}`);
    }
  }
  console.log(`${manifest.name}: ${files.size} tarball files checked`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Release artifact check passed (${packageDirectories.length} packages; dry run only).`,
  );
}
