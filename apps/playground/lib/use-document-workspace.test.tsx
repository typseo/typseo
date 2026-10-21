// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleDocument } from './documents';
import {
  documentStorageKey,
  useDocumentWorkspace,
} from './use-document-workspace';

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
        '<p>Unsaved second body</p>',
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
      html: '<p>Unsaved second body</p>',
    });

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(documentStorageKey) ?? '{}',
      );
      expect(stored.activeId).toBe(sampleDocument.id);
      expect(stored.documents[0].html).toBe('<p>Unsaved second body</p>');
    });
    first.unmount();

    const restored = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(restored.result.current.documents).toHaveLength(2),
    );
    expect(restored.result.current.activeId).toBe(sampleDocument.id);
    act(() => restored.result.current.selectDocument('new-document-id'));
    expect(restored.result.current.activeDocument.html).toBe(
      '<p>Unsaved second body</p>',
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
        '<p>Latest keystrokes</p>',
      ),
    );
    act(() => window.dispatchEvent(new Event('pagehide')));
    const stored = JSON.parse(localStorage.getItem(documentStorageKey) ?? '{}');
    expect(stored.documents[0].html).toBe('<p>Latest keystrokes</p>');
  });

  it('ignores invalid stored documents and keeps the sample available', async () => {
    localStorage.setItem(
      documentStorageKey,
      JSON.stringify({ documents: [{ id: 'broken' }], activeId: 'broken' }),
    );
    const { result } = renderHook(() => useDocumentWorkspace());
    await waitFor(() =>
      expect(result.current.activeDocument.id).toBe(sampleDocument.id),
    );
    expect(result.current.documents).toEqual([sampleDocument]);
  });
});
