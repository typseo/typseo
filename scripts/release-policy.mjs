export const betaVersion = '0.1.0-beta.0';

export function isExpectedBetaManifest(manifest) {
  return (
    manifest.version === betaVersion &&
    manifest.private !== true &&
    manifest.publishConfig?.access === 'public' &&
    manifest.publishConfig?.tag === 'beta'
  );
}
