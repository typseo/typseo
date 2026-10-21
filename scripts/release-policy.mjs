export function isExpectedBetaManifest(manifest) {
  return (
    /^\d+\.\d+\.\d+-beta\.\d+$/.test(manifest.version ?? '') &&
    manifest.private !== true &&
    manifest.publishConfig?.access === 'public' &&
    manifest.publishConfig?.tag === 'beta'
  );
}
