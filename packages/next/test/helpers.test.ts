import { describe, expect, it } from 'vitest';
import {
  createArticleJsonLd,
  createTypseoMetadata,
  serializeJsonLd,
} from '../src/index.js';

const document = {
  title: ' A practical SEO guide ',
  metaDescription: ' A helpful summary for readers. ',
};

describe('Next.js SEO helpers', () => {
  it('creates metadata with validated absolute URLs and no input mutation', () => {
    const before = { ...document };
    const metadata = createTypseoMetadata({
      document,
      canonicalUrl: 'https://example.com/articles/seo',
      imageUrl: 'https://example.com/images/seo.png',
      siteName: 'Example',
      type: 'article',
    });
    expect(metadata.title).toBe('A practical SEO guide');
    expect(metadata.description).toBe('A helpful summary for readers.');
    expect(metadata.alternates?.canonical).toBe(
      'https://example.com/articles/seo',
    );
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      url: 'https://example.com/articles/seo',
      images: ['https://example.com/images/seo.png'],
      siteName: 'Example',
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(document).toEqual(before);
  });

  it('omits absent metadata and rejects unsafe or relative URLs', () => {
    const metadata = createTypseoMetadata({
      document: { title: 'Page', metaDescription: ' ' },
    });
    expect(metadata.description).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.twitter).toMatchObject({ card: 'summary' });
    expect(() =>
      createTypseoMetadata({ document, canonicalUrl: '/relative' }),
    ).toThrow('canonicalUrl must be an absolute HTTP(S) URL');
    expect(() =>
      createTypseoMetadata({ document, imageUrl: 'javascript:alert(1)' }),
    ).toThrow('imageUrl must be an absolute HTTP(S) URL');
  });

  it('creates Article JSON-LD without invented fields and safely serializes it', () => {
    const schema = createArticleJsonLd({
      document: { title: '<script>alert(1)</script>', metaDescription: '' },
      url: new URL('https://example.com/story'),
      author: { name: 'Ada' },
    });
    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: '<script>alert(1)</script>',
      mainEntityOfPage: 'https://example.com/story',
      author: { '@type': 'Person', name: 'Ada' },
    });
    expect(schema).not.toHaveProperty('datePublished');
    expect(schema).not.toHaveProperty('description');
    const serialized = serializeJsonLd(schema);
    expect(serialized).not.toContain('<script>');
    expect(JSON.parse(serialized)).toEqual(schema);
    expect(() => serializeJsonLd(undefined)).toThrow('not serializable');
    expect(() =>
      createArticleJsonLd({ document, url: 'file:///tmp/a' }),
    ).toThrow('url must be an absolute HTTP(S) URL');
  });
});
