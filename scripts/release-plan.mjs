import { isExpectedBetaManifest } from './release-policy.mjs';

export function orderReleasePackages(manifests) {
  const byName = new Map();
  for (const manifest of manifests) {
    if (!manifest.name?.startsWith('@typseo/')) {
      throw new Error(`Unexpected release package: ${manifest.name}`);
    }
    if (!isExpectedBetaManifest(manifest)) {
      throw new Error(`${manifest.name}: expected a public beta manifest`);
    }
    if (byName.has(manifest.name)) {
      throw new Error(`Duplicate release package: ${manifest.name}`);
    }
    byName.set(manifest.name, manifest);
  }

  const ordered = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(name) {
    if (visiting.has(name)) throw new Error(`Circular dependency at ${name}`);
    if (visited.has(name)) return;
    const manifest = byName.get(name);
    if (!manifest) throw new Error(`Missing workspace package: ${name}`);
    visiting.add(name);
    const internalDependencies = new Set([
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.optionalDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ]);
    for (const dependency of [...internalDependencies].sort()) {
      if (dependency.startsWith('@typseo/')) visit(dependency);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(manifest);
  }
  for (const name of [...byName.keys()].sort()) visit(name);
  return ordered;
}

export function checkPackedDependencies(packedManifest, manifests) {
  const versions = new Map(
    manifests.map(({ name, version }) => [name, version]),
  );
  for (const dependencies of [
    packedManifest.dependencies,
    packedManifest.optionalDependencies,
    packedManifest.peerDependencies,
  ]) {
    for (const [name, range] of Object.entries(dependencies ?? {})) {
      if (range.startsWith('workspace:')) {
        throw new Error(`${packedManifest.name}: unresolved ${name}=${range}`);
      }
      if (name.startsWith('@typseo/') && range !== versions.get(name)) {
        throw new Error(
          `${packedManifest.name}: ${name} must be ${versions.get(name) ?? 'a workspace package'}, got ${range}`,
        );
      }
    }
  }
}
