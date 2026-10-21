import type { Editor } from '@tiptap/core';

export interface CapturedSelection {
  from: number;
  to: number;
  documentId: string;
}

/** Apply plain text only if the original passage is still at the captured range. */
export function applyAiEditToEditor(
  editor: Editor | null,
  selection: CapturedSelection | null,
  activeDocumentId: string,
  original: string,
  replacement: string,
): boolean {
  if (
    !editor ||
    !selection ||
    selection.documentId !== activeDocumentId ||
    selection.from >= selection.to ||
    selection.from < 0 ||
    selection.to > editor.state.doc.content.size ||
    editor.state.doc.textBetween(selection.from, selection.to, ' ') !== original
  )
    return false;
  const leading = original.match(/^\s*/u)?.[0] ?? '';
  const trailing = original.match(/\s*$/u)?.[0] ?? '';
  const preservedWhitespace = `${leading}${replacement.trim()}${trailing}`;
  editor.view.dispatch(
    editor.state.tr.insertText(
      preservedWhitespace,
      selection.from,
      selection.to,
    ),
  );
  return true;
}
