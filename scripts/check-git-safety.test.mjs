import { describe, expect, it } from 'vitest';
import { hasLikelySecret, isProhibitedPath } from './check-git-safety.mjs';

describe('Git safety rules', () => {
  it('rejects agent instructions and real environment files at any depth', () => {
    expect(isProhibitedPath('packages/core/AGENTS.md')).toBe(true);
    expect(isProhibitedPath('docs/.cursor/rules')).toBe(true);
    expect(isProhibitedPath('apps/playground/.env.local')).toBe(true);
    expect(isProhibitedPath('packages/ai/src/index.ts')).toBe(false);
    expect(isProhibitedPath('.env.example')).toBe(false);
  });

  it('detects likely tokens without rejecting ordinary source', () => {
    expect(hasLikelySecret('github_pat_' + 'A'.repeat(40))).toBe(true);
    expect(hasLikelySecret('export const title = "Typseo";')).toBe(false);
  });
});
