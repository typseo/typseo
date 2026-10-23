'use client';

import type { AnyExtension, EditorOptions, JSONContent } from '@tiptap/core';
import { useEditor, type Editor } from '@tiptap/react';
import { useEffect, useMemo, useRef } from 'react';
import { createTypseoPreset } from './preset.js';

export type TypseoEditorInstance = Editor;

export interface UseTypseoEditorOptions {
  /** Controlled HTML. Do not pass together with defaultValue. */
  value?: string;
  /** Initial HTML for an uncontrolled editor. */
  defaultValue?: string;
  /** Called with serialized HTML only when the document changes. */
  onChange?: (html: string, editor: Editor) => void;
  /** Controlled Tiptap JSON. Use instead of value. */
  document?: JSONContent;
  /** Initial Tiptap JSON for an uncontrolled editor. */
  defaultDocument?: JSONContent;
  /** Called with canonical JSON only when the document changes. */
  onDocumentChange?: (document: JSONContent, editor: Editor) => void;
  /** Additional Tiptap extensions. Configure default nodes/marks through starterKit. */
  extensions?: AnyExtension[];
  /** Set false to replace StarterKit with an entirely custom schema. */
  starterKit?: boolean;
  /** Opt in to paragraph and heading alignment. Existing documents are unchanged by default. */
  textAlign?: boolean;
  /** Opt in to checkable, nestable task lists. */
  taskLists?: boolean;
  editable?: boolean;
  editorProps?: EditorOptions['editorProps'];
  /** Recreate the editor (and undo history) when switching independent documents. */
  instanceKey?: string;
}

/**
 * A headless Tiptap adapter. The editor instance owns the hot path; React only
 * rerenders when the instance itself changes, not for every transaction.
 */
export function useTypseoEditor({
  value,
  defaultValue = '',
  onChange,
  document,
  defaultDocument,
  onDocumentChange,
  extensions,
  starterKit = true,
  textAlign = false,
  taskLists = false,
  editable = true,
  editorProps,
  instanceKey,
}: UseTypseoEditorOptions = {}): Editor | null {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onDocumentChangeRef = useRef(onDocumentChange);
  onDocumentChangeRef.current = onDocumentChange;
  const valueRef = useRef(value);
  valueRef.current = value;
  const documentRef = useRef(document);
  documentRef.current = document;

  // An inline array literal must not recreate the editor on every parent render.
  const extensionsRef = useRef<AnyExtension[]>([]);
  if (
    extensions &&
    (extensions.length !== extensionsRef.current.length ||
      extensions.some(
        (extension, index) => extension !== extensionsRef.current[index],
      ))
  ) {
    extensionsRef.current = extensions;
  }

  const configuredExtensions = useMemo(
    () =>
      createTypseoPreset({
        starterKit,
        textAlign,
        taskLists,
        extensions: extensionsRef.current,
      }),
    [extensionsRef.current, starterKit, textAlign, taskLists],
  );

  const editor = useEditor(
    {
      extensions: configuredExtensions,
      content: document ?? value ?? defaultDocument ?? defaultValue,
      editable,
      ...(editorProps ? { editorProps } : {}),
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onUpdate: ({ editor: updatedEditor }) => {
        if (onChangeRef.current) {
          const html = updatedEditor.getHTML();
          if (html !== valueRef.current)
            onChangeRef.current(html, updatedEditor);
        }
        if (onDocumentChangeRef.current) {
          const json = updatedEditor.getJSON();
          if (JSON.stringify(json) !== JSON.stringify(documentRef.current)) {
            onDocumentChangeRef.current(json, updatedEditor);
          }
        }
      },
    },
    [configuredExtensions, instanceKey],
  );

  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      value !== undefined &&
      editor.getHTML() !== value
    ) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      document !== undefined &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(document)
    ) {
      editor.commands.setContent(document, { emitUpdate: false });
    }
  }, [editor, document]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editorProps)
      editor.setOptions({ editorProps });
  }, [editor, editorProps]);

  return editor && !editor.isDestroyed ? editor : null;
}
