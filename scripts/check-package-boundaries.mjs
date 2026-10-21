import { readdirSync, readFileSync } from 'node:fs';

const root = new URL('../packages/', import.meta.url);
const packages = readdirSync(root, { withFileTypes: true }).filter((entry) =>
  entry.isDirectory(),
);
const names = new Set();
const failures = [];

for (const entry of packages) {
  const manifest = JSON.parse(
    readFileSync(new URL(`${entry.name}/package.json`, root), 'utf8'),
  );
  if (names.has(manifest.name))
    failures.push(`duplicate package name: ${manifest.name}`);
  names.add(manifest.name);
  if (!manifest.private)
    failures.push(
      `${manifest.name}: package must remain private before release`,
    );
  if (manifest.name === '@typseo/core') {
    const rootExport = manifest.exports?.['.'];
    if (
      Object.keys(manifest.exports ?? {}).length !== 1 ||
      rootExport?.types !== './dist/index.d.ts' ||
      rootExport?.default !== './dist/index.js'
    ) {
      failures.push('core must expose only its built public entry point');
    }
  } else if (
    !manifest.exports ||
    typeof manifest.exports !== 'object' ||
    Object.keys(manifest.exports).length !== 0
  ) {
    failures.push(`${manifest.name}: unfinished package must export nothing`);
  }
  if (manifest.name === '@typseo/core') {
    const deps = { ...manifest.dependencies, ...manifest.peerDependencies };
    if (
      Object.keys(deps).some((name) =>
        /^(react|next|@tiptap\/|@typseo\/)/.test(name),
      )
    ) {
      failures.push('core must remain framework independent');
    }
  }
  if (entry.name !== manifest.name.replace('@typseo/', ''))
    failures.push(`${entry.name}: directory/name mismatch`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Package boundary check passed (${packages.length} manifests).`);
