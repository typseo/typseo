import { analyzeSeoDocument, type SeoDocument } from '@typseo/core';
import type { JSONContent } from '@tiptap/core';

export interface DocumentMetadata {
  title: string;
  metaDescription: string;
  focusKeyword: string;
}

const blockContainers = new Set([
  'doc',
  'bulletList',
  'orderedList',
  'taskList',
  'listItem',
  'taskItem',
  'blockquote',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
]);

export function textFromNode(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  const parts = (node.content ?? []).map(textFromNode);
  return blockContainers.has(node.type ?? '')
    ? parts.filter(Boolean).join('\n')
    : parts.join('');
}

export function toSeoDocument(
  metadata: DocumentMetadata,
  content: JSONContent,
): SeoDocument {
  const headings: NonNullable<SeoDocument['headings']>[number][] = [];
  const images: NonNullable<SeoDocument['images']>[number][] = [];

  function visit(node: JSONContent) {
    if (node.type === 'heading') {
      const level = Number(node.attrs?.level);
      if (level >= 1 && level <= 6) {
        headings.push({
          level: level as 1 | 2 | 3 | 4 | 5 | 6,
          text: textFromNode(node),
        });
      }
    }
    if (node.type === 'image') {
      images.push({
        alt: typeof node.attrs?.alt === 'string' ? node.attrs.alt : '',
      });
    }
    node.content?.forEach(visit);
  }

  content.content?.forEach(visit);

  return {
    title: metadata.title,
    metaDescription: metadata.metaDescription,
    focusKeyword: metadata.focusKeyword,
    bodyText: [metadata.title.trim(), textFromNode(content)]
      .filter(Boolean)
      .join('\n'),
    headings: metadata.title.trim()
      ? [{ level: 1, text: metadata.title }, ...headings]
      : headings,
    images,
  };
}

export function analyzeEditorDocument(
  metadata: DocumentMetadata,
  content: JSONContent,
) {
  const snapshot = toSeoDocument(metadata, content);
  return { snapshot, analysis: analyzeSeoDocument(snapshot) };
}

export function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function countSentences(text: string): number {
  return text.split(/[.!?]+(?:\s|$)/).filter((part) => part.trim()).length;
}
