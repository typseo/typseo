'use client';

import type { AnyExtension, EditorOptions } from '@tiptap/core';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef } from 'react';

export type TypseoEditorInstance = Editor;

export interface UseTypseoEditorOptions {
  /** Controlled HTML. Do not pass together with defaultValue. */
  value?: string;
  /** Initial HTML for an uncontrolled editor. */
  defaultValue?: string;
  /** Called with serialized HTML only when the document changes. */
  onChange?: (html: string, editor: Editor) => void;
  /** Additional Tiptap extensions. Configure default nodes/marks through starterKit. */
  extensions?: AnyExtension[];
  /** Set false to replace StarterKit with an entirely custom schema. */
  starterKit?: boolean;
  editable?: boolean;
  editorProps?: EditorOptions['editorProps'];
}

/**
 * A headless Tiptap adapter. The editor instance owns the hot path; React only
 * rerenders when the instance itself changes, not for every transaction.
 */
export function useTypseoEditor({
  value,
  defaultValue = '',
  onChange,
  extensions,
  starterKit = true,
  editable = true,
  editorProps,
}: UseTypseoEditorOptions = {}): Editor | null {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

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
      starterKit
        ? [StarterKit, ...extensionsRef.current]
        : extensionsRef.current,
    [extensionsRef.current, starterKit],
  );

  const editor = useEditor(
    {
      extensions: configuredExtensions,
      content: value ?? defaultValue,
      editable,
      ...(editorProps ? { editorProps } : {}),
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onUpdate: ({ editor: updatedEditor }) => {
        const html = updatedEditor.getHTML();
        if (html !== valueRef.current)
          onChangeRef.current?.(html, updatedEditor);
      },
    },
    [configuredExtensions],
  );

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (editor && editorProps) editor.setOptions({ editorProps });
  }, [editor, editorProps]);

  return editor;
}
