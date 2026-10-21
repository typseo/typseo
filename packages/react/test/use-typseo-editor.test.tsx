// @vitest-environment jsdom

import { Extension } from '@tiptap/core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTypseoEditor } from '../src/index.js';

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
});
