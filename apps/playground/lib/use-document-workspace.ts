'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  makeNewDocument,
  sampleDocument,
  slugify,
  type PlaygroundDocument,
} from './documents';

export const documentStorageKey = 'typseo-playground-documents-v1';

function safeDocuments(value: unknown): PlaygroundDocument[] | null {
  if (!Array.isArray(value)) return null;
  const valid = value.filter(
    (item): item is PlaygroundDocument =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.metaDescription === 'string' &&
      typeof item.focusKeyword === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.html === 'string' &&
      typeof item.updatedAt === 'number',
  );
  return valid.length ? valid : null;
}

export function useDocumentWorkspace() {
  const [documents, setDocuments] = useState<PlaygroundDocument[]>([
    sampleDocument,
  ]);
  const [activeId, setActiveId] = useState(sampleDocument.id);
  const [storageReady, setStorageReady] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'editing'>('saved');
  const pendingHtml = useRef<string | null>(null);
  const pendingId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDocument =
    documents.find((item) => item.id === activeId) ??
    documents[0] ??
    sampleDocument;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(documentStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            documents?: unknown;
            activeId?: unknown;
          };
          const restored = safeDocuments(parsed.documents);
          if (restored) {
            setDocuments(restored);
            setActiveId(
              typeof parsed.activeId === 'string' &&
                restored.some((item) => item.id === parsed.activeId)
                ? parsed.activeId
                : restored[0]!.id,
            );
          }
        }
      } catch {
        /* Storage may be unavailable; editing still works in memory. */
      }
      setStorageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(
        documentStorageKey,
        JSON.stringify({ documents, activeId }),
      );
    } catch {
      /* In-memory editing remains available. */
    }
  }, [documents, activeId, storageReady]);

  // A tab may close before the debounce fires. Persist the latest body then.
  useEffect(() => {
    if (!storageReady) return;
    function handlePageHide() {
      const html = pendingHtml.current;
      const id = pendingId.current;
      if (html === null || !id) return;
      const next = documents.map((item) =>
        item.id === id ? { ...item, html, updatedAt: Date.now() } : item,
      );
      try {
        localStorage.setItem(
          documentStorageKey,
          JSON.stringify({ documents: next, activeId }),
        );
      } catch {
        /* In-memory editing remains available. */
      }
    }
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [documents, activeId, storageReady]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const commitPending = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (pendingHtml.current !== null && pendingId.current) {
      const html = pendingHtml.current;
      const id = pendingId.current;
      setDocuments((current) =>
        current.map((item) =>
          item.id === id ? { ...item, html, updatedAt: Date.now() } : item,
        ),
      );
      pendingHtml.current = null;
      pendingId.current = null;
    }
    setSaveState('saved');
  }, []);

  const scheduleBodySave = useCallback(
    (id: string, html: string, onSettled?: () => void) => {
      pendingHtml.current = html;
      pendingId.current = id;
      setSaveState('editing');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onSettled?.();
        commitPending();
      }, 350);
    },
    [commitPending],
  );

  function selectDocument(id: string) {
    if (id === activeId || !documents.some((item) => item.id === id)) return;
    commitPending();
    setActiveId(id);
  }

  function createDocument() {
    commitPending();
    const created = makeNewDocument();
    setDocuments((current) => [created, ...current]);
    setActiveId(created.id);
  }

  function updateDocument(patch: Partial<PlaygroundDocument>) {
    setDocuments((current) =>
      current.map((item) => {
        if (item.id !== activeId) return item;
        const next = { ...item, ...patch, updatedAt: Date.now() };
        if (
          patch.title !== undefined &&
          (!item.slug || item.slug === slugify(item.title))
        )
          next.slug = slugify(patch.title);
        return next;
      }),
    );
  }

  return {
    documents,
    activeId,
    activeDocument,
    saveState,
    scheduleBodySave,
    selectDocument,
    createDocument,
    updateDocument,
  };
}
