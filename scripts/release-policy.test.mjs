import { describe, expect, it } from 'vitest';
import { betaVersion, isExpectedBetaManifest } from './release-policy.mjs';

const betaManifest = {
  version: betaVersion,
  publishConfig: { access: 'public', tag: 'beta' },
};

describe('first beta release policy', () => {
  it('accepts the reviewed public beta manifest', () => {
    expect(isExpectedBetaManifest(betaManifest)).toBe(true);
  });

  it.each([
    { ...betaManifest, private: true },
    { ...betaManifest, version: '0.0.0' },
    { ...betaManifest, publishConfig: { access: 'restricted', tag: 'beta' } },
    { ...betaManifest, publishConfig: { access: 'public', tag: 'latest' } },
  ])('rejects a manifest outside the reviewed beta policy', (manifest) => {
    expect(isExpectedBetaManifest(manifest)).toBe(false);
  });
});
