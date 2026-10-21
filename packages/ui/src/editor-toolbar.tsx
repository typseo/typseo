'use client';

import { useEditorState } from '@tiptap/react';
import type {} from '@tiptap/starter-kit';
import type { TypseoEditorInstance } from '@typseo/react';

export interface EditorToolbarProps {
  editor: TypseoEditorInstance | null;
  className?: string;
}

const inactive = {
  bold: false,
  italic: false,
  heading: false,
  bulletList: false,
  orderedList: false,
  canUndo: false,
  canRedo: false,
};

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            heading: current.isActive('heading', { level: 2 }),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            canUndo: Boolean(current.commands.undo && current.can().undo()),
            canRedo: Boolean(current.commands.redo && current.can().redo()),
          }
        : inactive,
  });

  const disabled = !editor || !editor.isEditable;
  const selected = state ?? inactive;

  return (
    <div role="toolbar" aria-label="Text formatting" className={className}>
      <button
        type="button"
        aria-label="Bold"
        aria-pressed={selected.bold}
        disabled={disabled || !editor?.commands.toggleBold}
        onClick={() => {
          if (editor?.commands.toggleBold)
            editor.chain().focus().toggleBold().run();
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        aria-label="Italic"
        aria-pressed={selected.italic}
        disabled={disabled || !editor?.commands.toggleItalic}
        onClick={() => {
          if (editor?.commands.toggleItalic)
            editor.chain().focus().toggleItalic().run();
        }}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        aria-label="Heading 2"
        aria-pressed={selected.heading}
        disabled={disabled || !editor?.commands.toggleHeading}
        onClick={() => {
          if (editor?.commands.toggleHeading)
            editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
      >
        H2
      </button>
      <button
        type="button"
        aria-label="Bulleted list"
        aria-pressed={selected.bulletList}
        disabled={disabled || !editor?.commands.toggleBulletList}
        onClick={() => {
          if (editor?.commands.toggleBulletList)
            editor.chain().focus().toggleBulletList().run();
        }}
      >
        • List
      </button>
      <button
        type="button"
        aria-label="Numbered list"
        aria-pressed={selected.orderedList}
        disabled={disabled || !editor?.commands.toggleOrderedList}
        onClick={() => {
          if (editor?.commands.toggleOrderedList)
            editor.chain().focus().toggleOrderedList().run();
        }}
      >
        1. List
      </button>
      <button
        type="button"
        aria-label="Undo"
        disabled={disabled || !selected.canUndo}
        onClick={() => {
          if (editor?.commands.undo) editor.chain().focus().undo().run();
        }}
      >
        Undo
      </button>
      <button
        type="button"
        aria-label="Redo"
        disabled={disabled || !selected.canRedo}
        onClick={() => {
          if (editor?.commands.redo) editor.chain().focus().redo().run();
        }}
      >
        Redo
      </button>
    </div>
  );
}
