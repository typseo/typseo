import { copyFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = realpathSync(process.cwd());
const relativePath = relative(join(repositoryRoot, 'packages'), packageRoot);

if (
  !relativePath ||
  relativePath.startsWith('..') ||
  relativePath.includes(sep) ||
  basename(packageRoot) !== relativePath
) {
  throw new Error(
    'License copy must run from one direct packages/* directory.',
  );
}

copyFileSync(
  join(repositoryRoot, 'LICENSE'),
  join(packageRoot, 'dist', 'LICENSE'),
);
