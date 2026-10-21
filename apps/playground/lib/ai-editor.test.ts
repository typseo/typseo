// @vitest-environment jsdom

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { afterEach, describe, expect, it } from 'vitest';
import { applyAiEditToEditor } from './ai-editor';

const editors: Editor[] = [];
afterEach(() => editors.splice(0).forEach((editor) => editor.destroy()));

describe('reviewed AI edit application', () => {
  it('applies accepted plain text, but rejects stale passages and documents', () => {
    const editor = new Editor({
      extensions: [StarterKit],
      content: '<p>Hello world</p>',
    });
    editors.push(editor);
    const selection = { from: 1, to: 6, documentId: 'one' };
    expect(
      applyAiEditToEditor(editor, selection, 'two', 'Hello', 'Better'),
    ).toBe(false);
    expect(
      applyAiEditToEditor(editor, selection, 'one', 'Changed', 'Better'),
    ).toBe(false);
    expect(editor.getText()).toBe('Hello world');
    expect(
      applyAiEditToEditor(editor, selection, 'one', 'Hello', '<b>Better</b>'),
    ).toBe(true);
    expect(editor.getText()).toBe('<b>Better</b> world');
    expect(editor.getHTML()).not.toContain('<b>Better</b>');
    expect(
      applyAiEditToEditor(editor, selection, 'one', 'Hello', 'Again'),
    ).toBe(false);
  });

  it('preserves the whitespace included in a word selection', () => {
    const editor = new Editor({
      extensions: [StarterKit],
      content: '<p>compare products</p>',
    });
    editors.push(editor);
    expect(
      applyAiEditToEditor(
        editor,
        { from: 1, to: 9, documentId: 'one' },
        'one',
        'compare ',
        'Better',
      ),
    ).toBe(true);
    expect(editor.getText()).toBe('Better products');
  });
});
