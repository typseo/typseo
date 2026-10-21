import type { SeoDocument } from '@typseo/core';
import type { Metadata } from 'next';
import { absoluteHttpUrl } from './urls.js';

export interface TypseoMetadataOptions {
  document: Pick<SeoDocument, 'title' | 'metaDescription'>;
  canonicalUrl?: string | URL;
  imageUrl?: string | URL;
  siteName?: string;
  type?: 'article' | 'website';
}

/** Build App Router metadata without coupling the SEO engine to Next.js. */
export function createTypseoMetadata({
  document,
  canonicalUrl,
  imageUrl,
  siteName,
  type = 'website',
}: TypseoMetadataOptions): Metadata {
  const title = document.title.trim();
  const description = document.metaDescription?.trim();
  const canonical = canonicalUrl
    ? absoluteHttpUrl(canonicalUrl, 'canonicalUrl')
    : undefined;
  const image = imageUrl ? absoluteHttpUrl(imageUrl, 'imageUrl') : undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type,
      title,
      ...(description ? { description } : {}),
      ...(canonical ? { url: canonical } : {}),
      ...(image ? { images: [image] } : {}),
      ...(siteName ? { siteName } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
  };
}
