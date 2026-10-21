# SEO UI and Next.js helpers (M3)

M3 adds optional, unstyled SEO components in `@typseo/ui/seo`, controlled metadata fields in `@typseo/ui/metadata-editor`, and server-side helpers in `@typseo/next`. The core engine remains independent of React and Next.js. These packages remain private until release approval.

## Reusable SEO UI

```tsx
import { analyzeSeoDocument } from '@typseo/core';
import { SEOSidebar } from '@typseo/ui/seo';

const snapshot = {
  title: 'A clear page title',
  metaDescription: 'A useful summary of the page.',
  bodyText: 'A clear page title\nThe complete visible article text...',
  headings: [{ level: 1 as const, text: 'A clear page title' }],
};

const analysis = analyzeSeoDocument(snapshot);

export function ArticleAnalysis() {
  return (
    <SEOSidebar
      document={snapshot}
      analysis={analysis}
      url="https://example.com/article"
      className="article-analysis"
    />
  );
}
```

`SEOScore`, `SEOChecklist`, and `SERPPreview` can also be composed separately. They do not calculate a new score; pass the real `SeoAnalysis` from `@typseo/core`. `SEOChecklist` exposes `onSelectIssue(check)` when a host wants a failed item to focus its editor field. Supply host CSS through class names and descendant selectors. The score uses an accessible meter role; checklist rows expose `data-status` for styling. SERP preview is illustrative, not a promise about a search engine's actual snippet.

`MetadataEditor` and `KeywordInput` are controlled form components from `@typseo/ui/metadata-editor`. Import them inside a client component and keep their values in host state. They contain no storage or SEO rules.

## Next.js App Router

`@typseo/next` builds Next.js `Metadata` from a document's title and description. Absolute HTTP(S) URLs are required for optional canonical and image URLs; invalid values throw instead of emitting unsafe links. The helper does not fetch data, infer a domain, or import editor code.

```tsx
import {
  createArticleJsonLd,
  createTypseoMetadata,
  serializeJsonLd,
} from '@typseo/next';

const article = {
  title: 'A useful article',
  metaDescription: 'A concise summary for readers.',
};
const url = 'https://example.com/article';

export const metadata = createTypseoMetadata({
  document: article,
  canonicalUrl: url,
  type: 'article',
});

export default function Page() {
  const schema = createArticleJsonLd({ document: article, url });
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <h1>{article.title}</h1>
    </article>
  );
}
```

`serializeJsonLd` escapes `<` before insertion in a script element. The Article helper only emits provided author, date, and image fields; it does not fabricate them. Validate structured data against the relevant schema and search engine requirements before publishing.

The running example is at `/seo-example` in the Playground. Set `TYPSEO_EXAMPLE_SITE_URL` to your actual site origin before deploying it; otherwise the example omits canonical metadata and JSON-LD rather than publishing a fake URL. The example uses the same `@typseo/core` rules and reusable UI components.

Metadata helpers target Next.js App Router in the current supported workspace version. Pages Router integration is not claimed in M3. AI and external provider integration remain later milestones.
