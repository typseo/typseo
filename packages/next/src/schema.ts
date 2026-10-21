import type { SeoDocument } from '@typseo/core';
import { absoluteHttpUrl } from './urls.js';

export interface ArticleSchemaOptions {
  document: Pick<SeoDocument, 'title' | 'metaDescription'>;
  url: string | URL;
  imageUrl?: string | URL;
  author?: { name: string; url?: string | URL };
  datePublished?: string;
  dateModified?: string;
}

export interface ArticleJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  mainEntityOfPage: string;
  description?: string;
  image?: string;
  author?: { '@type': 'Person'; name: string; url?: string };
  datePublished?: string;
  dateModified?: string;
}

/** Supply only values known to the publisher; do not invent dates or authors. */
export function createArticleJsonLd({
  document,
  url,
  imageUrl,
  author,
  datePublished,
  dateModified,
}: ArticleSchemaOptions): ArticleJsonLd {
  const description = document.metaDescription?.trim();
  const image = imageUrl ? absoluteHttpUrl(imageUrl, 'imageUrl') : undefined;
  const authorUrl = author?.url
    ? absoluteHttpUrl(author.url, 'author.url')
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: document.title.trim(),
    mainEntityOfPage: absoluteHttpUrl(url, 'url'),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(author
      ? {
          author: {
            '@type': 'Person' as const,
            name: author.name.trim(),
            ...(authorUrl ? { url: authorUrl } : {}),
          },
        }
      : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

/** Safe to place in a native <script type="application/ld+json"> element. */
export function serializeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined)
    throw new TypeError('JSON-LD value is not serializable.');
  return json.replace(/</g, '\\u003c');
}
