import { describe, expect, it } from 'vitest';
import { analyzeSeoDocument, defaultSeoRules } from '../src/index.js';
import type { SeoDocument, SeoRule } from '../src/index.js';

const article: SeoDocument = {
  title: 'A practical guide to writing clear SEO titles',
  metaDescription:
    'Learn how to write useful titles and descriptions for readers, with practical examples and a clear publishing checklist.',
  bodyText: `A practical guide to writing clear SEO titles ${'useful '.repeat(200)}`,
  headings: [
    { level: 1, text: 'A practical guide to writing clear SEO titles' },
    { level: 2, text: 'Start with your reader' },
  ],
  images: [{ alt: 'An example search result with a clear title' }],
  focusKeyword: 'SEO titles',
};

describe('analyzeSeoDocument', () => {
  it('awards 100 when every applicable default rule passes', () => {
    const result = analyzeSeoDocument(article);
    expect(result.score).toBe(100);
    expect(result.earnedWeight).toBe(100);
    expect(result.applicableWeight).toBe(100);
    expect(result.issues).toEqual([]);
    expect(result.checks).toHaveLength(defaultSeoRules.length);
  });

  it('returns actionable issues and skips dependent checks when fields are absent', () => {
    const result = analyzeSeoDocument({ title: '', bodyText: '' });
    expect(result.issues.map(({ code }) => code)).toEqual([
      'TITLE_MISSING',
      'DESCRIPTION_MISSING',
      'BODY_TOO_SHORT',
      'H1_COUNT',
    ]);
    expect(result.checks.find(({ id }) => id === 'title-length')?.status).toBe(
      'skip',
    );
    expect(
      result.checks.find(({ id }) => id === 'description-length')?.status,
    ).toBe('skip');
    expect(result.checks.find(({ id }) => id === 'image-alt')?.status).toBe(
      'skip',
    );
    expect(result.score).toBe(0);
  });

  it('treats documented length thresholds as inclusive', () => {
    const atThreshold: SeoDocument = {
      title: 'T'.repeat(30),
      metaDescription: 'D'.repeat(70),
      bodyText: 'word '.repeat(200),
      headings: [{ level: 1, text: 'Title' }],
    };
    expect(analyzeSeoDocument(atThreshold).issues).toEqual([]);

    const belowThreshold = analyzeSeoDocument({
      ...atThreshold,
      title: 'T'.repeat(29),
      metaDescription: 'D'.repeat(69),
      bodyText: 'word '.repeat(199),
    });
    expect(belowThreshold.issues.map(({ code }) => code)).toEqual([
      'TITLE_LENGTH',
      'DESCRIPTION_LENGTH',
      'BODY_TOO_SHORT',
    ]);
  });

  it('does not match a focus keyword inside an unrelated word', () => {
    const result = analyzeSeoDocument({
      ...article,
      title: 'Catalog of practical writing advice for teams',
      focusKeyword: 'cat',
    });
    expect(result.issues.map(({ code }) => code)).toContain(
      'KEYWORD_MISSING_TITLE',
    );
  });

  it('matches Unicode phrases across punctuation and case', () => {
    const result = analyzeSeoDocument({
      ...article,
      title: 'Hướng dẫn viết Nội dung, TỐT cho website của bạn',
      bodyText: `Nội dung tốt: ${'hữu ích '.repeat(200)}`,
      focusKeyword: 'nội dung tốt',
    });
    expect(result.issues.map(({ code }) => code)).not.toContain(
      'KEYWORD_MISSING_TITLE',
    );
    expect(result.issues.map(({ code }) => code)).not.toContain(
      'KEYWORD_MISSING_BODY',
    );
  });

  it('flags heading jumps and missing informative image alt, but permits decorative images', () => {
    const result = analyzeSeoDocument({
      ...article,
      headings: [
        { level: 1, text: 'Guide' },
        { level: 3, text: 'Details' },
      ],
      images: [{ alt: '' }, { decorative: true, alt: '' }],
    });
    expect(result.issues.map(({ code }) => code)).toContain(
      'HEADING_LEVEL_SKIPPED',
    );
    expect(result.issues.map(({ code }) => code)).toContain(
      'IMAGE_ALT_MISSING',
    );
    expect(
      analyzeSeoDocument({
        ...article,
        images: [{ decorative: true, alt: '' }],
      }).issues,
    ).toEqual([]);
  });

  it('normalizes scores over applicable custom rules and rejects ambiguous rule definitions', () => {
    const rules: SeoRule[] = [
      { id: 'passing', weight: 2, evaluate: () => ({ status: 'pass' }) },
      {
        id: 'failing',
        weight: 1,
        evaluate: () => ({
          status: 'fail',
          issue: {
            code: 'CUSTOM_ISSUE',
            severity: 'error',
            field: 'title',
            message: 'Custom issue',
          },
        }),
      },
      { id: 'skipped', weight: 5, evaluate: () => ({ status: 'skip' }) },
    ];
    const result = analyzeSeoDocument(article, rules);
    expect(result.applicableWeight).toBe(3);
    expect(result.earnedWeight).toBe(2);
    expect(result.score).toBe(67);
    expect(analyzeSeoDocument(article, [rules[2]!]).score).toBe(0);
    expect(() => analyzeSeoDocument(article, [rules[0]!, rules[0]!])).toThrow(
      'unique and nonempty',
    );
    expect(() =>
      analyzeSeoDocument(article, [
        {
          id: 'invalid',
          weight: Number.NaN,
          evaluate: () => ({ status: 'pass' }),
        },
      ]),
    ).toThrow('positive and finite');
    expect(() =>
      analyzeSeoDocument(article, [
        {
          id: 'broken',
          weight: 1,
          evaluate: () => ({ status: 'fail' }),
        } as SeoRule,
      ]),
    ).toThrow('must provide an issue');
  });

  it('does not mutate the document passed by a caller', () => {
    const frozen = Object.freeze({ ...article });
    expect(() => analyzeSeoDocument(frozen)).not.toThrow();
  });
});
