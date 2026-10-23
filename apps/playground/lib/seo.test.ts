import { describe, expect, it } from 'vitest';
import {
  analyzeEditorDocument,
  countWords,
  textFromNode,
  toSeoDocument,
} from './seo';

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
    expect(snapshot.bodyText).toBe('SEO Guide\nStrategy\nUseful SEO content.');
    expect(snapshot.images).toEqual([{ alt: '' }]);
  });

  it('ignores alignment attributes in the SEO text snapshot', () => {
    const snapshot = toSeoDocument(
      { title: 'Aligned page', metaDescription: '', focusKeyword: '' },
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
            content: [{ type: 'text', text: 'Readable content' }],
          },
        ],
      },
    );
    expect(snapshot.bodyText).toBe('Aligned page\nReadable content');
  });

  it('extracts task items as separate blocks without exposing checked state', () => {
    const snapshot = toSeoDocument(
      { title: 'Checklist', metaDescription: '', focusKeyword: '' },
      {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: true },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Research' }],
                  },
                ],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Publish' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    );
    expect(snapshot.bodyText).toBe('Checklist\nResearch\nPublish');
  });

  it('separates block text without splitting inline marks or hard breaks', () => {
    expect(
      textFromNode({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hel' },
              { type: 'text', text: 'lo' },
              { type: 'hardBreak' },
              { type: 'text', text: 'there' },
            ],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'World' }] },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'One' }],
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Two' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Quote' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'again' }] },
            ],
          },
        ],
      }),
    ).toBe('Hello\nthere\nWorld\nOne\nTwo\nQuote\nagain');
  });

  it('keeps the rendered page title in body text and detects a second H1', () => {
    const snapshot = toSeoDocument(
      { title: 'Page title', metaDescription: '', focusKeyword: '' },
      {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Editor heading' }],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'Body copy' }] },
        ],
      },
    );
    expect(snapshot.bodyText).toBe('Page title\nEditor heading\nBody copy');
    expect(snapshot.headings).toEqual([
      { level: 1, text: 'Page title' },
      { level: 1, text: 'Editor heading' },
    ]);
    expect(
      analyzeEditorDocument(
        { title: 'Page title', metaDescription: '', focusKeyword: '' },
        {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Editor heading' }],
            },
          ],
        },
      ).analysis.issues.some((issue) => issue.code === 'H1_COUNT'),
    ).toBe(true);
  });

  it('does not turn adjacent paragraphs into one keyword', () => {
    const result = analyzeEditorDocument(
      { title: '', metaDescription: '', focusKeyword: 'helloworld' },
      {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'world' }] },
        ],
      },
    );
    expect(result.snapshot.bodyText).toBe('hello\nworld');
    expect(
      result.analysis.issues.some(
        (issue) => issue.code === 'KEYWORD_MISSING_BODY',
      ),
    ).toBe(true);
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
