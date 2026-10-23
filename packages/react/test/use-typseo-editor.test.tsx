// @vitest-environment jsdom

import { Extension } from '@tiptap/core';
import TextAlign from '@tiptap/extension-text-align';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTypseoPreset, useTypseoEditor } from '../src/index.js';

describe('useTypseoEditor', () => {
  it('starts uncontrolled and emits HTML on document updates', async () => {
    const onChange = vi.fn();
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultValue: '<p>Initial</p>', onChange }),
    );

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.getHTML()).toBe('<p>Initial</p>');

    act(() => {
      result.current?.commands.setContent('<p>Updated</p>');
    });
    expect(onChange).toHaveBeenCalledWith('<p>Updated</p>', result.current);
    unmount();
  });

  it('applies external controlled values without echoing onChange', async () => {
    const onChange = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useTypseoEditor({ value, onChange }),
      { initialProps: { value: '<p>One</p>' } },
    );

    await waitFor(() => expect(result.current).not.toBeNull());
    rerender({ value: '<p>Two</p>' });
    await waitFor(() => expect(result.current?.getHTML()).toBe('<p>Two</p>'));
    expect(onChange).not.toHaveBeenCalled();
    unmount();
  });

  it('accepts consumer extensions', async () => {
    const customExtension = Extension.create({ name: 'typseoTestExtension' });
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ extensions: [customExtension] }),
    );

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(
      result.current?.extensionManager.extensions.some(
        (extension) => extension.name === 'typseoTestExtension',
      ),
    ).toBe(true);
    unmount();
  });

  it('does not recreate the editor for an equivalent inline extension list', async () => {
    const customExtension = Extension.create({ name: 'stableExtension' });
    const { result, rerender, unmount } = renderHook(() =>
      useTypseoEditor({ extensions: [customExtension] }),
    );

    await waitFor(() => expect(result.current).not.toBeNull());
    const instance = result.current;
    rerender();
    expect(result.current).toBe(instance);
    unmount();
  });

  it('accepts controlled JSON and emits canonical JSON without echoing external changes', async () => {
    const initial = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'One' }] },
      ],
    };
    const next = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Two' }] },
      ],
    };
    const onDocumentChange = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ document }) => useTypseoEditor({ document, onDocumentChange }),
      { initialProps: { document: initial } },
    );
    await waitFor(() => expect(result.current?.getJSON()).toEqual(initial));
    rerender({ document: next });
    await waitFor(() => expect(result.current?.getJSON()).toEqual(next));
    expect(onDocumentChange).not.toHaveBeenCalled();
    act(() => result.current?.commands.insertContent('!'));
    expect(onDocumentChange).toHaveBeenCalledWith(
      result.current?.getJSON(),
      result.current,
    );
    unmount();
  });

  it('rejects duplicate consumer extensions in the preset', () => {
    const extension = Extension.create({ name: 'duplicate' });
    expect(() =>
      createTypseoPreset({ extensions: [extension, extension] }),
    ).toThrow('Duplicate Tiptap extension: duplicate');
    expect(createTypseoPreset({ extensions: [extension] })).toHaveLength(2);
    expect(() =>
      createTypseoPreset({
        extensions: [Extension.create({ name: 'paragraph' })],
      }),
    ).toThrow('Duplicate Tiptap extension: paragraph');
    expect(() =>
      createTypseoPreset({ textAlign: true, extensions: [TextAlign] }),
    ).toThrow('Duplicate Tiptap extension: textAlign');
    expect(() =>
      createTypseoPreset({ taskLists: true, extensions: [TaskList] }),
    ).toThrow('Duplicate Tiptap extension: taskList');
    expect(() =>
      createTypseoPreset({ taskLists: true, extensions: [TaskItem] }),
    ).toThrow('Duplicate Tiptap extension: taskItem');
  });

  it('keeps task lists opt-in and restores checked JSON', async () => {
    const saved = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Reviewed' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(
      createTypseoPreset().some((extension) => extension.name === 'taskList'),
    ).toBe(false);
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultDocument: saved, taskLists: true }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.getJSON()).toEqual(saved);
    expect(result.current?.getHTML()).toContain('data-checked="true"');
    unmount();
  });

  it('keeps alignment opt-in and restores aligned JSON', async () => {
    const aligned = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: 'Aligned' }],
        },
      ],
    };
    expect(
      createTypseoPreset().some((extension) => extension.name === 'textAlign'),
    ).toBe(false);
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({ defaultDocument: aligned, textAlign: true }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBe(
      'right',
    );
    expect(result.current?.getHTML()).toContain('text-align: right');
    unmount();
  });

  it('hydrates an aligned draft after an initially empty editor without echoing a change', async () => {
    const empty = { type: 'doc', content: [{ type: 'paragraph' }] };
    const saved = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Saved draft' }],
        },
      ],
    };
    const onDocumentChange = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ ready }) =>
        useTypseoEditor({
          document: ready ? saved : empty,
          textAlign: true,
          onDocumentChange: (content, editor) => {
            if (ready) onDocumentChange(content, editor);
          },
        }),
      { initialProps: { ready: false } },
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    rerender({ ready: true });
    await waitFor(() =>
      expect(result.current?.getJSON().content?.[0]?.attrs?.textAlign).toBe(
        'center',
      ),
    );
    expect(onDocumentChange).not.toHaveBeenCalled();
    unmount();
  });

  it('keeps undo and redo for JSON-backed editing', async () => {
    const { result, unmount } = renderHook(() =>
      useTypseoEditor({
        defaultDocument: { type: 'doc', content: [{ type: 'paragraph' }] },
      }),
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    act(() => result.current?.commands.insertContent('Draft'));
    expect(result.current?.getText()).toBe('Draft');
    act(() => result.current?.commands.undo());
    expect(result.current?.getText()).toBe('');
    act(() => result.current?.commands.redo());
    expect(result.current?.getText()).toBe('Draft');
    unmount();
  });

  it('resets undo history when the instance key changes', async () => {
    const first = { type: 'doc', content: [{ type: 'paragraph' }] };
    const second = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
      ],
    };
    const { result, rerender, unmount } = renderHook(
      ({ document, instanceKey }) => useTypseoEditor({ document, instanceKey }),
      { initialProps: { document: first, instanceKey: 'first' } },
    );
    await waitFor(() => expect(result.current).not.toBeNull());
    const original = result.current;
    act(() => result.current?.commands.insertContent('Edited first'));
    rerender({ document: second, instanceKey: 'second' });
    await waitFor(() => expect(result.current).not.toBe(original));
    expect(result.current?.getText()).toBe('Second');
    expect(result.current?.can().undo()).toBe(false);
    unmount();
  });
});
