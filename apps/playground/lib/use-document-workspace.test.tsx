// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { generateHTML } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { createTypseoPreset } from '@typseo/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleDocument } from './documents';
import { toSeoDocument } from './seo';
import {
  documentStorageKey,
  legacyDocumentStorageKey,
  useDocumentWorkspace,
} from './use-document-workspace';

const body = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('crypto', { randomUUID: () => 'new-document-id' });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('Playground document workspace', () => {
  it('saves a pending body to its original document before switching and restores both documents', async () => {
    const first = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(localStorage.getItem(documentStorageKey)).not.toBeNull(),
    );

    act(() => first.result.current.createDocument());
    expect(first.result.current.activeId).toBe('new-document-id');
    act(() => first.result.current.updateDocument({ title: 'Second draft' }));
    act(() =>
      first.result.current.scheduleBodySave(
        'new-document-id',
        body('Unsaved second body'),
      ),
    );
    expect(first.result.current.saveState).toBe('editing');

    act(() => first.result.current.selectDocument(sampleDocument.id));
    expect(first.result.current.activeId).toBe(sampleDocument.id);
    expect(first.result.current.saveState).toBe('saved');
    expect(
      first.result.current.documents.find(
        (item) => item.id === 'new-document-id',
      ),
    ).toMatchObject({
      title: 'Second draft',
      slug: 'second-draft',
      content: body('Unsaved second body'),
    });

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(documentStorageKey) ?? '{}',
      );
      expect(stored.activeId).toBe(sampleDocument.id);
      expect(stored.documents[0].content).toEqual(body('Unsaved second body'));
    });
    first.unmount();

    const restored = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(restored.result.current.documents).toHaveLength(2),
    );
    expect(restored.result.current.activeId).toBe(sampleDocument.id);
    act(() => restored.result.current.selectDocument('new-document-id'));
    expect(restored.result.current.activeDocument.content).toEqual(
      body('Unsaved second body'),
    );
  });

  it('flushes a pending edit to storage when the page closes before debounce', async () => {
    const { result } = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(localStorage.getItem(documentStorageKey)).not.toBeNull(),
    );
    act(() =>
      result.current.scheduleBodySave(
        sampleDocument.id,
        body('Latest keystrokes'),
      ),
    );
    act(() => window.dispatchEvent(new Event('pagehide')));
    const stored = JSON.parse(localStorage.getItem(documentStorageKey) ?? '{}');
    expect(stored.documents[0].content).toEqual(body('Latest keystrokes'));
  });

  it('ignores invalid stored documents and keeps the sample available', async () => {
    localStorage.setItem(
      documentStorageKey,
      JSON.stringify({ documents: [{ id: 'broken' }], activeId: 'broken' }),
    );
    const { result } = renderHook(() => useDocumentWorkspace());
    await waitFor(() => expect(result.current.storageError).not.toBeNull());
    expect(result.current.activeDocument.id).toBe(sampleDocument.id);
    expect(result.current.documents).toEqual([sampleDocument]);
    expect(result.current.storageError).toMatch(/could not be loaded/);
  });

  it('migrates legacy HTML once and keeps the v1 backup untouched', async () => {
    const legacy = {
      documents: [
        {
          id: 'legacy',
          title: 'Old draft',
          metaDescription: '',
          focusKeyword: '',
          slug: 'old-draft',
          updatedAt: 42,
          html: '<h2>Heading</h2><p>Linked <a href="https://example.com">text</a></p><ul><li><p>Item</p></li></ul><p><img src="https://example.com/a.png" alt="Chart"></p>',
        },
      ],
      activeId: 'legacy',
    };
    const backup = JSON.stringify(legacy);
    localStorage.setItem(legacyDocumentStorageKey, backup);
    const first = renderHook(() => useDocumentWorkspace());
    await waitFor(() => expect(first.result.current.activeId).toBe('legacy'));
    expect(first.result.current.activeDocument.content.type).toBe('doc');
    const migratedContent = first.result.current.activeDocument.content;
    const html = generateHTML(
      migratedContent,
      createTypseoPreset({ extensions: [Image] }),
    );
    expect(html).toContain('<h2>Heading</h2>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('<ul>');
    expect(html).toContain('src="https://example.com/a.png"');
    const snapshot = toSeoDocument(
      { title: 'Old draft', metaDescription: '', focusKeyword: '' },
      migratedContent,
    );
    expect(snapshot.headings).toEqual([
      { level: 1, text: 'Old draft' },
      { level: 2, text: 'Heading' },
    ]);
    expect(snapshot.bodyText).toContain('Linked text');
    expect(snapshot.images).toEqual([{ alt: 'Chart' }]);
    expect(first.result.current.storageError).toBeNull();
    expect(localStorage.getItem(legacyDocumentStorageKey)).toBe(backup);
    first.unmount();
    const restored = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(restored.result.current.activeId).toBe('legacy'),
    );
    expect(restored.result.current.activeDocument.content).toEqual(
      first.result.current.activeDocument.content,
    );
  });

  it('does not overwrite legacy data when migration would discard unsupported content', async () => {
    const legacy = {
      documents: [
        {
          id: 'legacy',
          title: 'Old draft',
          metaDescription: '',
          focusKeyword: '',
          slug: '',
          updatedAt: 1,
          html: '<p>Keep this</p><script>do not execute this</script>',
        },
      ],
      activeId: 'legacy',
    };
    const backup = JSON.stringify(legacy);
    localStorage.setItem(legacyDocumentStorageKey, backup);
    const { result } = renderHook(() => useDocumentWorkspace());
    await waitFor(() => expect(result.current.storageError).not.toBeNull());
    expect(localStorage.getItem(documentStorageKey)).toBeNull();
    expect(localStorage.getItem(legacyDocumentStorageKey)).toBe(backup);
  });
});
