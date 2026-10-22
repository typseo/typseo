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
  underline: false,
  strike: false,
  heading: 0,
  bulletList: false,
  orderedList: false,
  canUndo: false,
  canRedo: false,
};

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current && !current.isDestroyed
        ? {
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            strike: current.isActive('strike'),
            heading: current.isActive('heading')
              ? Number(current.getAttributes('heading').level)
              : 0,
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
      <select
        aria-label="Text style"
        value={selected.heading}
        disabled={disabled || !editor?.commands.setHeading}
        onChange={(event) => {
          const level = Number(event.target.value);
          if (level === 0) editor?.chain().focus().setParagraph().run();
          else
            editor
              ?.chain()
              .focus()
              .setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
              .run();
        }}
      >
        <option value={0}>Paragraph</option>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <option key={level} value={level}>
            Heading {level}
          </option>
        ))}
      </select>
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
        aria-label="Underline"
        aria-pressed={selected.underline}
        disabled={disabled || !editor?.commands.toggleUnderline}
        onClick={() => {
          if (editor?.commands.toggleUnderline)
            editor.chain().focus().toggleUnderline().run();
        }}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        aria-label="Strikethrough"
        aria-pressed={selected.strike}
        disabled={disabled || !editor?.commands.toggleStrike}
        onClick={() => {
          if (editor?.commands.toggleStrike)
            editor.chain().focus().toggleStrike().run();
        }}
      >
        <s>S</s>
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
