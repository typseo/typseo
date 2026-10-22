import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkPackedDependencies,
  orderReleasePackages,
} from './release-plan.mjs';
import { isExpectedBetaManifest } from './release-policy.mjs';
import { isPublishedOnNpm } from './registry-lookup.mjs';

if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.GITHUB_REPOSITORY !== 'typseo/typseo' ||
  process.env.GITHUB_REF !== 'refs/heads/main'
) {
  throw new Error(
    'Staging is only allowed from typseo/typseo main in GitHub Actions',
  );
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(root, 'packages');
const tarballRoot = join(root, 'release-tarballs');
const manifests = orderReleasePackages(
  readdirSync(packageRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      JSON.parse(
        readFileSync(join(packageRoot, entry.name, 'package.json'), 'utf8'),
      ),
    ),
);
const pending = [];
for (const manifest of manifests) {
  const spec = `${manifest.name}@${manifest.version}`;
  const tarball = join(
    tarballRoot,
    `${manifest.name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz`,
  );
  if (!existsSync(tarball)) throw new Error(`${spec}: missing packed tarball`);
  const packed = JSON.parse(
    execFileSync('tar', ['-xOf', tarball, 'package/package.json'], {
      encoding: 'utf8',
    }),
  );
  if (
    packed.name !== manifest.name ||
    packed.version !== manifest.version ||
    !isExpectedBetaManifest(packed)
  ) {
    throw new Error(`${spec}: packed identity mismatch`);
  }
  checkPackedDependencies(packed, manifests);

  if (await isPublishedOnNpm(manifest.name, manifest.version)) {
    console.log(`Already public: ${spec}`);
    continue;
  }

  pending.push({ spec, tarball });
}

for (const { spec, tarball } of pending) {
  console.log(`Staging ${spec} for npm maintainer approval`);
  execFileSync(
    'npm',
    [
      'stage',
      'publish',
      tarball,
      '--tag',
      'beta',
      '--access',
      'public',
      '--ignore-scripts',
    ],
    { cwd: root, stdio: 'inherit' },
  );
}
console.log(`Staged ${pending.length} package(s) for maintainer approval.`);
