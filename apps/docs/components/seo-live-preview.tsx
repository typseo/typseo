'use client';

import { useMemo, useState } from 'react';
import { analyzeSeoDocument } from '@typseo/core';
import { SEOChecklist, SEOScore, SERPPreview } from '@typseo/ui/seo';
import { MetadataEditor } from '@typseo/ui/metadata-editor';
import type { EditableMetadata } from '@typseo/ui/metadata-editor';

export function SeoLivePreview() {
  const [metadata, setMetadata] = useState<EditableMetadata>({
    title: 'A practical guide to writing clear page titles',
    metaDescription:
      'Learn how to make page titles and descriptions useful for readers, with a concrete publishing checklist.',
    focusKeyword: 'page titles',
  });
  const document = useMemo(
    () => ({
      ...metadata,
      bodyText: `${metadata.title}\n${'Write a useful page for readers. '.repeat(40)}`,
      headings: [{ level: 1 as const, text: metadata.title }],
    }),
    [metadata],
  );
  const analysis = useMemo(() => analyzeSeoDocument(document), [document]);

  return (
    <div className="typseo-preview">
      <div className="typseo-preview-header">
        <span>Live preview · @typseo/ui</span>
        <span>Client-side only</span>
      </div>
      <MetadataEditor value={metadata} onChange={setMetadata} />
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <SEOScore analysis={analysis} />
          <SEOChecklist analysis={analysis} />
        </div>
        <SERPPreview document={document} url="https://example.com/article" />
      </div>
    </div>
  );
}
