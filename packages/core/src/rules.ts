import { characterCount, cleanText, containsPhrase, words } from './text.js';
import type { SeoIssue, SeoRule, SeoRuleResult } from './types.js';

function fail(issue: SeoIssue): SeoRuleResult {
  return { status: 'fail', issue };
}

const pass: SeoRuleResult = { status: 'pass' };
const skip: SeoRuleResult = { status: 'skip' };

/** Default thresholds are editorial heuristics, not search-engine guarantees. */
export const defaultSeoRules: readonly SeoRule[] = [
  {
    id: 'title-present',
    weight: 20,
    evaluate: ({ title }) =>
      cleanText(title)
        ? pass
        : fail({
            code: 'TITLE_MISSING',
            severity: 'error',
            field: 'title',
            message: 'Add a descriptive page title.',
          }),
  },
  {
    id: 'title-length',
    weight: 10,
    evaluate: ({ title }) => {
      if (!cleanText(title)) return skip;
      const length = characterCount(title);
      return length >= 30 && length <= 60
        ? pass
        : fail({
            code: 'TITLE_LENGTH',
            severity: 'warning',
            field: 'title',
            message: 'Aim for a title between 30 and 60 characters.',
          });
    },
  },
  {
    id: 'description-present',
    weight: 10,
    evaluate: ({ metaDescription }) =>
      cleanText(metaDescription ?? '')
        ? pass
        : fail({
            code: 'DESCRIPTION_MISSING',
            severity: 'error',
            field: 'metaDescription',
            message: 'Add a meta description.',
          }),
  },
  {
    id: 'description-length',
    weight: 10,
    evaluate: ({ metaDescription }) => {
      if (!cleanText(metaDescription ?? '')) return skip;
      const length = characterCount(metaDescription ?? '');
      return length >= 70 && length <= 160
        ? pass
        : fail({
            code: 'DESCRIPTION_LENGTH',
            severity: 'warning',
            field: 'metaDescription',
            message:
              'Aim for a meta description between 70 and 160 characters.',
          });
    },
  },
  {
    id: 'body-length',
    weight: 15,
    evaluate: ({ bodyText }) =>
      words(bodyText).length >= 200
        ? pass
        : fail({
            code: 'BODY_TOO_SHORT',
            severity: 'warning',
            field: 'bodyText',
            message: 'Consider adding more useful, original body content.',
          }),
  },
  {
    id: 'h1-count',
    weight: 10,
    evaluate: ({ headings }) =>
      (headings ?? []).filter(({ level }) => level === 1).length === 1
        ? pass
        : fail({
            code: 'H1_COUNT',
            severity: 'warning',
            field: 'headings',
            message: 'Use exactly one H1 heading on the page.',
          }),
  },
  {
    id: 'heading-order',
    weight: 5,
    evaluate: ({ headings }) => {
      if (!headings || headings.length < 2) return skip;
      for (let index = 1; index < headings.length; index++) {
        const previous = headings[index - 1];
        const current = headings[index];
        if (previous && current && current.level > previous.level + 1) {
          return fail({
            code: 'HEADING_LEVEL_SKIPPED',
            severity: 'warning',
            field: 'headings',
            message: 'Do not skip heading levels when nesting sections.',
          });
        }
      }
      return pass;
    },
  },
  {
    id: 'image-alt',
    weight: 10,
    evaluate: ({ images }) => {
      if (!images || images.length === 0) return skip;
      return images.every(
        ({ alt, decorative }) => decorative || cleanText(alt ?? ''),
      )
        ? pass
        : fail({
            code: 'IMAGE_ALT_MISSING',
            severity: 'warning',
            field: 'images',
            message: 'Add descriptive alt text to informative images.',
          });
    },
  },
  {
    id: 'keyword-title',
    weight: 5,
    evaluate: ({ title, focusKeyword }) => {
      if (!cleanText(focusKeyword ?? '') || !cleanText(title)) return skip;
      return containsPhrase(title, focusKeyword ?? '')
        ? pass
        : fail({
            code: 'KEYWORD_MISSING_TITLE',
            severity: 'warning',
            field: 'title',
            message: 'Consider using the focus keyword naturally in the title.',
          });
    },
  },
  {
    id: 'keyword-body',
    weight: 5,
    evaluate: ({ bodyText, focusKeyword }) => {
      if (!cleanText(focusKeyword ?? '') || !cleanText(bodyText)) return skip;
      return containsPhrase(bodyText, focusKeyword ?? '')
        ? pass
        : fail({
            code: 'KEYWORD_MISSING_BODY',
            severity: 'warning',
            field: 'bodyText',
            message: 'Consider using the focus keyword naturally in the body.',
          });
    },
  },
];
