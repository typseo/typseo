import { generateJSON, type JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { createTypseoPreset } from '@typseo/react';
import type { PlaygroundDocument } from './documents';

export interface StoredWorkspace {
  documents: PlaygroundDocument[];
  activeId: string;
}

const legacyExtensions = createTypseoPreset({ extensions: [Image] });

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContent(value: unknown): value is JSONContent {
  return (
    record(value) &&
    value.type === 'doc' &&
    Array.isArray(value.content) &&
    value.content.every(isNode)
  );
}

function isNode(value: unknown): value is JSONContent {
  return (
    record(value) &&
    typeof value.type === 'string' &&
    (value.content === undefined ||
      (Array.isArray(value.content) && value.content.every(isNode)))
  );
}

function validDocument(value: unknown): value is PlaygroundDocument {
  return (
    record(value) &&
    value.schemaVersion === 2 &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.metaDescription === 'string' &&
    typeof value.focusKeyword === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.updatedAt === 'number' &&
    isContent(value.content)
  );
}

export function parseWorkspace(value: unknown): StoredWorkspace | null {
  if (!record(value) || !Array.isArray(value.documents)) return null;
  const documents = value.documents.filter(validDocument);
  if (!documents.length || documents.length !== value.documents.length)
    return null;
  return {
    documents,
    activeId:
      typeof value.activeId === 'string' &&
      documents.some((item) => item.id === value.activeId)
        ? value.activeId
        : documents[0]!.id,
  };
}

function textFromJson(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return ' ';
  const separator = new Set([
    'doc',
    'bulletList',
    'orderedList',
    'listItem',
    'blockquote',
  ]).has(node.type ?? '')
    ? ' '
    : '';
  return (node.content ?? []).map(textFromJson).join(separator);
}

function textFromDom(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element) && !(node instanceof Document)) return '';
  if (node instanceof Element && node.tagName === 'BR') return ' ';
  const separator =
    node instanceof Document ||
    (node instanceof Element &&
      ['BODY', 'UL', 'OL', 'LI', 'BLOCKQUOTE'].includes(node.tagName))
      ? ' '
      : '';
  return [...node.childNodes].map(textFromDom).join(separator);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function attributesFromJson(
  node: JSONContent,
  type: string,
  key: string,
): string[] {
  return [
    ...(node.type === type && typeof node.attrs?.[key] === 'string'
      ? [node.attrs[key] as string]
      : []),
    ...(node.content ?? []).flatMap((child) =>
      attributesFromJson(child, type, key),
    ),
  ];
}

function linksFromJson(node: JSONContent): string[] {
  return [
    ...(node.marks ?? [])
      .filter(
        (mark) => mark.type === 'link' && typeof mark.attrs?.href === 'string',
      )
      .map((mark) => mark.attrs!.href as string),
    ...(node.content ?? []).flatMap(linksFromJson),
  ];
}

/** Browser-only migration. Throw rather than silently discarding unsupported data. */
export function migrateLegacyWorkspace(value: unknown): StoredWorkspace {
  if (
    !record(value) ||
    !Array.isArray(value.documents) ||
    !value.documents.length
  )
    throw new Error('Invalid legacy workspace');

  const documents: PlaygroundDocument[] = value.documents.map((item) => {
    if (
      !record(item) ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.metaDescription !== 'string' ||
      typeof item.focusKeyword !== 'string' ||
      typeof item.slug !== 'string' ||
      typeof item.html !== 'string' ||
      typeof item.updatedAt !== 'number'
    ) {
      throw new Error('Invalid legacy document');
    }
    const parsed = new DOMParser().parseFromString(item.html, 'text/html');
    const content = generateJSON(item.html, legacyExtensions) as JSONContent;
    const oldText = normalizeText(textFromDom(parsed.body));
    const newText = normalizeText(textFromJson(content));
    const oldImages = [...parsed.body.querySelectorAll('img')].map(
      (image) => image.getAttribute('src') ?? '',
    );
    const newImages = attributesFromJson(content, 'image', 'src');
    const oldLinks = [...parsed.body.querySelectorAll('a')].map(
      (link) => link.getAttribute('href') ?? '',
    );
    const newLinks = linksFromJson(content);
    if (
      oldText !== newText ||
      JSON.stringify(oldImages) !== JSON.stringify(newImages) ||
      JSON.stringify(oldLinks) !== JSON.stringify(newLinks)
    ) {
      throw new Error(
        `Legacy document ${item.id} could not be migrated without loss`,
      );
    }
    return {
      schemaVersion: 2,
      id: item.id,
      title: item.title,
      metaDescription: item.metaDescription,
      focusKeyword: item.focusKeyword,
      slug: item.slug,
      content,
      updatedAt: item.updatedAt,
    };
  });
  return {
    documents,
    activeId:
      typeof value.activeId === 'string' &&
      documents.some((item) => item.id === value.activeId)
        ? value.activeId
        : documents[0]!.id,
  };
}
