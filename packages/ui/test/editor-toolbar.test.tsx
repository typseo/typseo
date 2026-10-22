// @vitest-environment jsdom

import { useTypseoEditor } from '@typseo/react';
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
});
