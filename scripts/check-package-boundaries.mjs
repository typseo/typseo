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
  const builtExports = {
    '@typseo/core': ['.'],
    '@typseo/react': ['.'],
    '@typseo/ui': ['.', './seo', './metadata-editor', './ai'],
    '@typseo/ai': ['.', './server'],
    '@typseo/next': ['.'],
  }[manifest.name];
  if (builtExports) {
    const actual = Object.keys(manifest.exports ?? {}).sort();
    const expected = [...builtExports].sort();
    if (
      actual.join(',') !== expected.join(',') ||
      expected.some((key) => {
        const stem = key === '.' ? 'index' : key.slice(2);
        const entry = manifest.exports?.[key];
        return (
          entry?.types !== `./dist/${stem}.d.ts` ||
          entry?.default !== `./dist/${stem}.js`
        );
      })
    ) {
      failures.push(`${manifest.name}: unexpected public exports`);
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
  if (manifest.name === '@typseo/next') {
    const deps = { ...manifest.dependencies, ...manifest.peerDependencies };
    if (
      Object.keys(deps).some(
        (name) =>
          name === 'react' ||
          name === 'react-dom' ||
          name.startsWith('@tiptap/') ||
          name === '@typseo/ui' ||
          name === '@typseo/react',
      )
    ) {
      failures.push('next helpers must not depend on React, Tiptap, or UI');
    }
  }
  if (manifest.name === '@typseo/ai') {
    const deps = { ...manifest.dependencies, ...manifest.peerDependencies };
    if (
      Object.keys(deps).some(
        (name) =>
          name === 'react' ||
          name === 'next' ||
          name.startsWith('@tiptap/') ||
          name === '@typseo/ui',
      )
    ) {
      failures.push(
        'AI provider contracts must not depend on UI or editor packages',
      );
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
