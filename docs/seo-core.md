# SEO Core (M1)

`@typseo/core` evaluates a plain snapshot of a page. It has no React, Tiptap, Next.js, network, or provider-SDK dependency. The package remains private while the API is developed; it is not published to npm.

```ts
import { analyzeSeoDocument } from '@typseo/core';

const analysis = analyzeSeoDocument({
  title: 'A practical guide to writing clear SEO titles',
  metaDescription:
    'Learn how to write useful titles and descriptions for readers, with practical examples and a clear publishing checklist.',
  bodyText: 'The complete visible page text, including its headings...',
  headings: [
    { level: 1, text: 'A practical guide to writing clear SEO titles' },
    { level: 2, text: 'Start with your reader' },
  ],
  images: [{ alt: 'A search result with a clear page title' }],
  focusKeyword: 'SEO titles',
});

console.log(analysis.score, analysis.issues, analysis.checks);
```

`bodyText` must be the complete visible text, including heading text. `headings` must be in rendered order and include the page H1. An image may set `decorative: true` if it intentionally needs no descriptive alt. `focusKeyword` is optional; keyword checks are skipped when absent.

Each check has a weight and a `pass`, `fail`, or `skip` status. The score is the rounded percentage of _applicable_ weight earned. Skipped checks do not lower the score. A failing check carries an issue code, severity, field, and actionable message. Callers can pass a different `SeoRule[]` as the second argument to replace the default rules. Rule IDs must be unique and weights positive and finite.

Default guidance: title 30–60 characters, meta description 70–160 characters, body at least 200 word-like tokens, exactly one H1, no skipped heading levels, and alt text for informative images. These are editorial heuristics, **not** Google ranking factors or guarantees. Search-result snippets vary, and the score is not a prediction of ranking. The tokenizer recognizes Unicode letters and numbers but does not perform language-specific word segmentation; CJK word counts may need a custom rule set.

The engine is synchronous and does not fetch pages or inspect rendered DOM. An editor adapter in M2 should build the snapshot and schedule analysis with debounce or equivalent, rather than analyzing on every keystroke. No editor integration or bundle-size benchmark is claimed in M1.
