'use client';

import type { JSONContent } from '@tiptap/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { migrateLegacyWorkspace, parseWorkspace } from './document-migration';
import {
  makeNewDocument,
  sampleDocument,
  slugify,
  type PlaygroundDocument,
} from './documents';

export const legacyDocumentStorageKey = 'typseo-playground-documents-v1';
export const documentStorageKey = 'typseo-playground-documents-v2';

export function useDocumentWorkspace() {
  const [documents, setDocuments] = useState<PlaygroundDocument[]>([
    sampleDocument,
  ]);
  const [activeId, setActiveId] = useState(sampleDocument.id);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'editing'>('saved');
  const pendingContent = useRef<JSONContent | null>(null);
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
          const restored = parseWorkspace(JSON.parse(stored) as unknown);
          if (!restored) throw new Error('Stored JSON documents are invalid');
          setDocuments(restored.documents);
          setActiveId(restored.activeId);
        } else {
          const legacy = localStorage.getItem(legacyDocumentStorageKey);
          if (legacy) {
            const migrated = migrateLegacyWorkspace(
              JSON.parse(legacy) as unknown,
            );
            // Commit the entire new workspace atomically; keep the v1 backup.
            localStorage.setItem(documentStorageKey, JSON.stringify(migrated));
            setDocuments(migrated.documents);
            setActiveId(migrated.activeId);
          }
        }
      } catch {
        setStorageError(
          'Your stored drafts could not be loaded safely. The original data remains in this browser; export a backup before editing.',
        );
      }
      setStorageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady || storageError) return;
    let cancelled = false;
    try {
      localStorage.setItem(
        documentStorageKey,
        JSON.stringify({ documents, activeId }),
      );
    } catch {
      queueMicrotask(() => {
        if (!cancelled)
          setStorageError(
            'Local storage is unavailable. Changes are only kept until this tab closes.',
          );
      });
    }
    return () => {
      cancelled = true;
    };
  }, [documents, activeId, storageReady, storageError]);

  useEffect(() => {
    if (!storageReady || storageError) return;
    function handlePageHide() {
      const content = pendingContent.current;
      const id = pendingId.current;
      if (content === null || !id) return;
      const next = documents.map((item) =>
        item.id === id ? { ...item, content, updatedAt: Date.now() } : item,
      );
      try {
        localStorage.setItem(
          documentStorageKey,
          JSON.stringify({ documents: next, activeId }),
        );
      } catch {
        /* The original v1 backup, if present, remains untouched. */
      }
    }
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [documents, activeId, storageReady, storageError]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const commitPending = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (pendingContent.current !== null && pendingId.current) {
      const content = pendingContent.current;
      const id = pendingId.current;
      setDocuments((current) =>
        current.map((item) =>
          item.id === id ? { ...item, content, updatedAt: Date.now() } : item,
        ),
      );
      pendingContent.current = null;
      pendingId.current = null;
    }
    setSaveState('saved');
  }, []);

  const scheduleBodySave = useCallback(
    (id: string, content: JSONContent, onSettled?: () => void) => {
      pendingContent.current = content;
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
        const next = {
          ...item,
          ...patch,
          schemaVersion: 2 as const,
          updatedAt: Date.now(),
        };
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
    storageReady,
    saveState,
    storageError,
    scheduleBodySave,
    selectDocument,
    createDocument,
    updateDocument,
  };
}
