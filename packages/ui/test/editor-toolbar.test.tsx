// @vitest-environment jsdom

import { useTypseoEditor } from '@typseo/react';
import { EditorContent } from '@tiptap/react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EditorToolbar } from '../src/editor-toolbar.js';

afterEach(cleanup);

describe('EditorToolbar typography', () => {
  it('offers Paragraph and all six headings and keeps changes undoable', async () => {
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultValue: '<p>Title</p>' }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    render(<EditorToolbar editor={result.current} />);
    expect(
      screen.queryByRole('combobox', { name: 'Text alignment' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Task list' })).toBeNull();

    const style = screen.getByRole('combobox', { name: 'Text style' });
    expect(style.querySelectorAll('option')).toHaveLength(7);
    for (const level of [1, 2, 3, 4, 5, 6]) {
      fireEvent.change(style, { target: { value: String(level) } });
      expect(result.current?.getJSON().content?.[0]).toMatchObject({
        type: 'heading',
        attrs: { level },
        content: [{ type: 'text', text: 'Title' }],
      });
      expect(style).toHaveProperty('value', String(level));
    }
    fireEvent.change(style, { target: { value: '0' } });
    expect(result.current?.getJSON().content?.[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Title' }],
    });
    expect(style).toHaveProperty('value', '0');

    fireEvent.change(style, { target: { value: '6' } });
    act(() => result.current?.commands.undo());
    expect(result.current?.getJSON().content?.[0]?.type).toBe('paragraph');
    act(() => result.current?.commands.redo());
    expect(result.current?.getJSON().content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 6 },
    });
    unmount();
  });

  it('preserves underline and strikethrough in serialized JSON', async () => {
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultValue: '<p>Words</p>' }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    render(<EditorToolbar editor={result.current} />);

    act(() => result.current?.commands.setTextSelection({ from: 1, to: 6 }));
    fireEvent.click(screen.getByRole('button', { name: 'Underline' }));
    fireEvent.click(screen.getByRole('button', { name: 'Strikethrough' }));
    const json = result.current?.getJSON();
    expect(
      json?.content?.[0]?.content?.[0]?.marks?.map((mark) => mark.type),
    ).toEqual(expect.arrayContaining(['underline', 'strike']));

    act(() => result.current?.commands.setContent(json ?? ''));
    expect(result.current?.getJSON()).toEqual(json);
    unmount();
  });

  it('disables formatting when the editor is unavailable', () => {
    render(<EditorToolbar editor={null} />);
    expect(screen.getByRole('combobox', { name: 'Text style' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByRole('button', { name: 'Underline' })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('shows alignment only when enabled and keeps it undoable', async () => {
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultValue: '<p>Words</p>', textAlign: true }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    render(<EditorToolbar editor={result.current} />);

    const alignment = screen.getByRole('combobox', { name: 'Text alignment' });
    fireEvent.change(alignment, { target: { value: 'center' } });
    expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBe(
      'center',
    );
    act(() => result.current?.commands.undo());
    expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBeNull();
    act(() => result.current?.commands.redo());
    expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBe(
      'center',
    );

    fireEvent.change(alignment, { target: { value: 'left' } });
    expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBeNull();
    unmount();
  });

  it('toggles task lists only when enabled and keeps the change undoable', async () => {
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultValue: '<p>Ship it</p>', taskLists: true }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    render(<EditorToolbar editor={result.current} />);
    render(<EditorContent editor={result.current} />);

    const button = screen.getByRole('button', { name: 'Task list' });
    fireEvent.click(button);
    expect(result.current?.getJSON().content?.[0]).toMatchObject({
      type: 'taskList',
      content: [{ type: 'taskItem', attrs: { checked: false } }],
    });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    act(() => result.current?.commands.undo());
    expect(result.current?.getJSON().content?.[0]?.type).toBe('paragraph');
    act(() => result.current?.commands.redo());
    expect(result.current?.getJSON().content?.[0]?.type).toBe('taskList');
    fireEvent.click(screen.getByRole('checkbox'));
    const checked = result.current?.getJSON();
    expect(checked?.content?.[0]?.content?.[0]?.attrs?.checked).toBe(true);
    act(() => result.current?.commands.setContent(checked ?? ''));
    expect(result.current?.getJSON()).toEqual(checked);
    unmount();
  });
});
