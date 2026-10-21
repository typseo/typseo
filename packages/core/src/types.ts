/** An editor-independent snapshot of the page a reader will see. */
export interface SeoDocument {
  title: string;
  metaDescription?: string;
  /** Plain text of the complete visible body, including heading text. */
  bodyText: string;
  /** Headings in their rendered order, including the H1 if the page has one. */
  headings?: readonly SeoHeading[];
  images?: readonly SeoImage[];
  /** Optional phrase to check in the title and body. */
  focusKeyword?: string;
}

export interface SeoHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface SeoImage {
  alt?: string;
  /** Decorative images intentionally need no descriptive alt text. */
  decorative?: boolean;
}

export type SeoField =
  'title' | 'metaDescription' | 'bodyText' | 'headings' | 'images';

export type SeoIssueCode =
  | 'TITLE_MISSING'
  | 'TITLE_LENGTH'
  | 'DESCRIPTION_MISSING'
  | 'DESCRIPTION_LENGTH'
  | 'BODY_TOO_SHORT'
  | 'H1_COUNT'
  | 'HEADING_LEVEL_SKIPPED'
  | 'IMAGE_ALT_MISSING'
  | 'KEYWORD_MISSING_TITLE'
  | 'KEYWORD_MISSING_BODY';

export interface SeoIssue {
  /** Built-in codes are documented; custom rules may use their own codes. */
  code: SeoIssueCode | (string & {});
  severity: 'error' | 'warning';
  field: SeoField;
  message: string;
}

export type SeoRuleResult =
  { status: 'pass' } | { status: 'skip' } | { status: 'fail'; issue: SeoIssue };

/** Consumers can supply a replacement rule set without any editor dependency. */
export interface SeoRule {
  id: string;
  weight: number;
  evaluate(document: SeoDocument): SeoRuleResult;
}

export interface SeoCheck {
  id: string;
  weight: number;
  status: SeoRuleResult['status'];
  issue?: SeoIssue;
}

export interface SeoAnalysis {
  /** Rounded percentage of applicable rule weight earned, from 0 to 100. */
  score: number;
  earnedWeight: number;
  applicableWeight: number;
  checks: readonly SeoCheck[];
  issues: readonly SeoIssue[];
}
