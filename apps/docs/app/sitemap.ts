import type { MetadataRoute } from 'next';
import { source } from '../lib/source';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_DOCS_SITE_URL;
  if (!origin) return [];
  return [
    {
      url: new URL('/', origin).toString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...source.getPages().map((page) => ({
      url: new URL(page.url, origin).toString(),
      changeFrequency: 'weekly' as const,
      priority: page.slugs.length === 0 ? 0.9 : 0.7,
    })),
  ];
}
