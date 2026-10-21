import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_DOCS_SITE_URL;
  return origin
    ? {
        rules: { userAgent: '*', allow: '/' },
        sitemap: new URL('/sitemap.xml', origin).toString(),
      }
    : { rules: { userAgent: '*', disallow: '/' } };
}
