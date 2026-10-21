import { describe, expect, it } from 'vitest';
import { analyzeEditorDocument, countWords, toSeoDocument } from './seo';

const content = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Strategy' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Useful SEO content.' }],
    },
    { type: 'image', attrs: { src: 'https://example.com/chart.png', alt: '' } },
  ],
};

describe('playground SEO adapter', () => {
  it('maps title, editor headings, body text and image alt into the core model', () => {
    const snapshot = toSeoDocument(
      {
        title: 'SEO Guide',
        metaDescription: 'Description',
        focusKeyword: 'SEO',
      },
      content,
    );
    expect(snapshot.headings).toEqual([
      { level: 1, text: 'SEO Guide' },
      { level: 2, text: 'Strategy' },
    ]);
    expect(snapshot.bodyText).toContain('Useful SEO content.');
    expect(snapshot.images).toEqual([{ alt: '' }]);
  });

  it('uses the real engine so changes to content change results', () => {
    const metadata = {
      title: 'SEO Guide',
      metaDescription: '',
      focusKeyword: 'SEO',
    };
    const before = analyzeEditorDocument(metadata, content).analysis;
    const after = analyzeEditorDocument(
      {
        ...metadata,
        metaDescription:
          'A helpful description about SEO that is long enough to pass the rule.',
      },
      content,
    ).analysis;
    expect(
      before.issues.some((issue) => issue.code === 'DESCRIPTION_MISSING'),
    ).toBe(true);
    expect(after.score).toBeGreaterThan(before.score);
  });

  it('counts words across Unicode text', () => {
    expect(countWords('Viết bài SEO hữu ích')).toBe(5);
  });
});
