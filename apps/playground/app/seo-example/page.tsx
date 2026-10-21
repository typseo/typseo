import { analyzeSeoDocument, type SeoDocument } from '@typseo/core';
import {
  createArticleJsonLd,
  createTypseoMetadata,
  serializeJsonLd,
} from '@typseo/next';
import { SEOChecklist, SEOScore, SERPPreview } from '@typseo/ui/seo';
import Link from 'next/link';

const sections = [
  {
    heading: 'Start with reader questions',
    paragraphs: [
      'Useful search content begins with the questions people actually ask. Interview customers, review support conversations, and study the language readers use before they know your product. A clear answer to a real problem is more valuable than a page written only to repeat a search phrase.',
      'Group related questions into a focused article. Each section should help a reader make progress, whether that means understanding a concept, comparing approaches, or deciding what to try next.',
    ],
  },
  {
    heading: 'Give every page a clear structure',
    paragraphs: [
      'Write one descriptive page title and a concise summary for search results. Use headings to show the order of ideas, and place supporting details beneath the section where readers expect to find them. Descriptive image text helps when an image adds information; decorative images can remain decorative.',
      'Structure is useful beyond a checklist. It makes the page easier to scan, easier to maintain, and easier for other developers to reuse in different layouts without changing the underlying editorial content.',
    ],
  },
  {
    heading: 'Measure and improve the result',
    paragraphs: [
      'Publish, then check whether the right readers find the page and whether the content helps them. Search visibility alone cannot tell you if an article solves the original problem. Review engagement, customer feedback, and meaningful product outcomes together.',
      'Return to the article as your product and audience change. Update dated examples, strengthen unclear passages, and remove advice that no longer helps. The goal is a dependable resource, not a perfect score on a single day.',
    ],
  },
] as const;

const article: SeoDocument = {
  title: 'A Practical Guide to Useful SEO Content',
  metaDescription:
    'Learn how to plan useful SEO content, structure each page clearly, and improve articles using reader feedback and meaningful outcomes.',
  focusKeyword: 'SEO content',
  bodyText: [
    'A Practical Guide to Useful SEO Content',
    ...sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ].join('\n'),
  headings: [
    { level: 1, text: 'A Practical Guide to Useful SEO Content' },
    ...sections.map((section) => ({
      level: 2 as const,
      text: section.heading,
    })),
  ],
};

const siteUrl = process.env.TYPSEO_EXAMPLE_SITE_URL;
const canonicalUrl = siteUrl
  ? new URL('/seo-example', siteUrl).href
  : undefined;

export const metadata = createTypseoMetadata({
  document: article,
  ...(canonicalUrl ? { canonicalUrl } : {}),
  type: 'article',
  siteName: 'Typseo Playground',
});

export default function SeoExamplePage() {
  const analysis = analyzeSeoDocument(article);
  const jsonLd = canonicalUrl
    ? serializeJsonLd(
        createArticleJsonLd({ document: article, url: canonicalUrl }),
      )
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <header className="mb-10 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Typseo · M3 integration example
            </p>
            <p className="mt-1 text-lg font-semibold">
              Next.js metadata + SEO UI
            </p>
          </div>
          <Link href="/" className="text-sm underline underline-offset-4">
            Back to Playground
          </Link>
        </header>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="max-w-[70ch]">
            <h1 className="mb-5 text-3xl font-bold tracking-tight">
              {article.title}
            </h1>
            <p className="mb-10 text-base leading-7 text-muted-foreground">
              {article.metaDescription}
            </p>
            {sections.map((section) => (
              <section key={section.heading} className="mb-9">
                <h2 className="mb-3 text-xl font-semibold">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mb-4 leading-7">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
          <aside
            className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
            aria-label="Reusable SEO components"
          >
            <h2 className="mb-3 text-base font-semibold">SEO analysis</h2>
            <SEOScore
              analysis={analysis}
              className="mb-6 flex items-baseline gap-1 text-2xl"
            />
            <SEOChecklist
              analysis={analysis}
              className="mb-8 [&_li]:border-b [&_li]:border-border [&_li]:py-2 [&_li_div]:flex [&_li_div]:flex-wrap [&_li_div]:justify-between [&_li_div]:gap-2 [&_li_small]:w-full [&_li_small]:text-muted-foreground [&_li_span:last-of-type]:text-muted-foreground"
            />
            <h3 className="mb-3 text-sm font-semibold">
              Search result preview
            </h3>
            <SERPPreview
              document={article}
              url={canonicalUrl ?? '/seo-example'}
              className="flex flex-col gap-1 rounded-lg border border-border p-4 [&_small]:text-muted-foreground [&_strong]:font-medium [&_strong]:text-blue-700 dark:[&_strong]:text-blue-300 [&_p]:text-sm [&_p]:leading-6"
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
