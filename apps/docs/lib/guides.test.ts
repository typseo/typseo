import { describe, expect, it } from 'vitest';
import { guideOrder, guides } from './guides';

describe('documentation guide registry', () => {
  it('gives every navigation item a complete page', () => {
    expect(new Set(guideOrder).size).toBe(guideOrder.length);
    for (const slug of guideOrder) {
      const guide = guides[slug];
      expect(guide?.title).toBeTruthy();
      expect(guide?.description).toBeTruthy();
      expect(guide?.blocks.length).toBeGreaterThan(0);
    }
  });

  it('documents both workspace-only installation and snapshot boundaries', () => {
    const setup = guides['getting-started'];
    const seo = guides.seo;
    expect(
      setup?.blocks.some(
        (block) =>
          block.type === 'code' &&
          block.code.includes('pnpm install --frozen-lockfile'),
      ),
    ).toBe(true);
    expect(
      seo?.blocks.some(
        (block) =>
          block.type === 'section' && block.text.includes('block boundaries'),
      ),
    ).toBe(true);
  });
});
