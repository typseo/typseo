import type { MetadataRoute } from 'next';
import { source } from '../lib/source';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_DOCS_SITE_URL;
  if (!origin) return [];
  return source.getPages().map((page) => ({
    url: new URL(page.url, origin).toString(),
    changeFrequency: 'weekly',
    priority: page.slugs.length === 0 ? 1 : 0.7,
  }));
}
