import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isExpectedBetaManifest } from './release-policy.mjs';
import { checkPackedDependencies } from './release-plan.mjs';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(repositoryRoot, 'packages');
const packageDirectories = readdirSync(packageRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const packageManifests = packageDirectories.map((directory) => {
  return JSON.parse(
    readFileSync(join(packageRoot, directory, 'package.json'), 'utf8'),
  );
});
const temporaryRoot = mkdtempSync(join(tmpdir(), 'typseo-packed-consumer-'));
const tarballDirectory = join(temporaryRoot, 'tarballs');
const consumerDirectory = join(temporaryRoot, 'consumer');

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
}

try {
  mkdirSync(tarballDirectory);
  mkdirSync(consumerDirectory);

  const localPackages = {};
  for (const directory of packageDirectories) {
    const cwd = join(packageRoot, directory);
    const manifest = JSON.parse(
      readFileSync(join(cwd, 'package.json'), 'utf8'),
    );
    const filename = `${manifest.name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz`;
    run('pnpm', ['pack', '--pack-destination', tarballDirectory], cwd);
    const tarballPath = join(tarballDirectory, filename);
    if (!existsSync(tarballPath)) {
      throw new Error(`${manifest.name}: pnpm pack did not create ${filename}`);
    }
    const packedManifest = JSON.parse(
      run('tar', ['-xOf', tarballPath, 'package/package.json'], cwd),
    );
    if (!isExpectedBetaManifest(packedManifest)) {
      throw new Error(`${manifest.name}: packed beta metadata is incorrect`);
    }
    checkPackedDependencies(packedManifest, packageManifests);
    localPackages[manifest.name] = `file:../tarballs/${filename}`;
  }

  writeFileSync(
    join(consumerDirectory, 'package.json'),
    JSON.stringify(
      {
        name: 'typseo-packed-consumer-smoke',
        private: true,
        type: 'module',
        dependencies: {
          ...localPackages,
          next: '16.4.2',
          react: '19.3.1',
          'react-dom': '19.3.1',
        },
        pnpm: { overrides: localPackages },
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(consumerDirectory, 'smoke.mjs'),
    `const specifiers = ${JSON.stringify([
      '@typseo/ahrefs/server',
      '@typseo/ai',
      '@typseo/ai/server',
      '@typseo/core',
      '@typseo/gsc/server',
      '@typseo/next',
      '@typseo/react',
      '@typseo/ui',
      '@typseo/ui/ai',
      '@typseo/ui/metadata-editor',
      '@typseo/ui/seo',
    ])};
for (const specifier of specifiers) {
  const imported = await import(specifier);
  if (!imported || typeof imported !== 'object') {
    throw new Error('Unable to import ' + specifier);
  }
  console.log('Imported ' + specifier);
}
`,
  );

  run(
    'pnpm',
    ['install', '--prefer-offline', '--ignore-scripts'],
    consumerDirectory,
  );
  console.log(run('node', ['smoke.mjs'], consumerDirectory));
  console.log(
    `Packed consumer smoke check passed (${packageDirectories.length} local tarballs).`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
