export function isExpectedBetaManifest(manifest) {
  return (
    /^\d+\.\d+\.\d+-beta\.\d+$/.test(manifest.version ?? '') &&
    manifest.private !== true &&
    manifest.publishConfig?.access === 'public' &&
    manifest.publishConfig?.tag === 'beta'
  );
}

export function hasUnpublishedClaim(readme) {
  return /still private|do not install from npm|not yet published to npm/i.test(
    readme,
  );
}
