'use client';

import { EditorContent } from '@tiptap/react';
import { useTypseoEditor, type UseTypseoEditorOptions } from '@typseo/react';
import { useMemo } from 'react';
import { EditorToolbar } from './editor-toolbar.js';

export interface TypseoEditorProps extends UseTypseoEditorOptions {
  className?: string;
  toolbarClassName?: string;
  contentClassName?: string;
  /** Accessible label for the editable region. */
  ariaLabel?: string;
  showToolbar?: boolean;
}

/** Unstyled, composable editor shell. Class names let a host provide its theme. */
export function TypseoEditor({
  className,
  toolbarClassName,
  contentClassName,
  ariaLabel = 'Content editor',
  showToolbar = true,
  editorProps,
  ...options
}: TypseoEditorProps) {
  const mergedEditorProps = useMemo(
    () => ({
      ...editorProps,
      attributes: {
        ...editorProps?.attributes,
        'aria-label': ariaLabel,
      },
    }),
    [editorProps, ariaLabel],
  );
  const editor = useTypseoEditor({
    ...options,
    editorProps: mergedEditorProps,
  });

  return (
    <div className={className}>
      {showToolbar && (
        <EditorToolbar
          editor={editor}
          {...(toolbarClassName ? { className: toolbarClassName } : {})}
        />
      )}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
