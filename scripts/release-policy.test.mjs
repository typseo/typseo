import { describe, expect, it } from 'vitest';
import {
  hasUnpublishedClaim,
  isExpectedBetaManifest,
} from './release-policy.mjs';

const betaManifest = {
  version: '0.1.0-beta.0',
  publishConfig: { access: 'public', tag: 'beta' },
};

describe('first beta release policy', () => {
  it('accepts the reviewed public beta manifest', () => {
    expect(isExpectedBetaManifest(betaManifest)).toBe(true);
    expect(
      isExpectedBetaManifest({ ...betaManifest, version: '0.1.0-beta.1' }),
    ).toBe(true);
    expect(
      isExpectedBetaManifest({ ...betaManifest, version: '1.2.3-beta.12' }),
    ).toBe(true);
  });

  it.each([
    { ...betaManifest, private: true },
    { ...betaManifest, version: '0.0.0' },
    { ...betaManifest, version: '0.1.0' },
    { ...betaManifest, version: '0.1.0-alpha.1' },
    { ...betaManifest, publishConfig: { access: 'restricted', tag: 'beta' } },
    { ...betaManifest, publishConfig: { access: 'public', tag: 'latest' } },
  ])('rejects a manifest outside the reviewed beta policy', (manifest) => {
    expect(isExpectedBetaManifest(manifest)).toBe(false);
  });
});

describe('public beta README policy', () => {
  it.each([
    'This package is still private.',
    'Do not install from npm yet.',
    'Packages are not yet published to npm.',
  ])('rejects stale unpublished guidance: %s', (readme) => {
    expect(hasUnpublishedClaim(readme)).toBe(true);
  });

  it('accepts public beta installation guidance', () => {
    expect(
      hasUnpublishedClaim('Available as a public beta. Pin an exact version.'),
    ).toBe(false);
  });
});
