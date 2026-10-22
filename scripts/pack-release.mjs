import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { orderReleasePackages } from './release-plan.mjs';

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

mkdirSync(tarballRoot, { recursive: true });
for (const manifest of manifests) {
  const cwd = join(packageRoot, manifest.name.slice('@typseo/'.length));
  execFileSync('pnpm', ['pack', '--pack-destination', tarballRoot], {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}
console.log(`Packed ${manifests.length} beta packages into ${tarballRoot}`);
