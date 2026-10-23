import { resolveExtensions, type AnyExtension } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';

export interface TypseoPresetOptions {
  /** Disable StarterKit only when supplying a complete replacement schema. */
  starterKit?: boolean;
  /** Opt in to paragraph and heading alignment without changing existing schemas. */
  textAlign?: boolean;
  /** Opt in to checkable, nestable task lists. */
  taskLists?: boolean;
  extensions?: AnyExtension[];
}

const starterKitNames = new Set(
  resolveExtensions([StarterKit]).map((extension) => extension.name),
);

/** Build one editor schema without registering the same extension twice. */
export function createTypseoPreset({
  starterKit = true,
  textAlign = false,
  taskLists = false,
  extensions = [],
}: TypseoPresetOptions = {}): AnyExtension[] {
  const names = new Set<string>(starterKit ? starterKitNames : []);
  if (textAlign) names.add('textAlign');
  if (taskLists) {
    names.add('taskList');
    names.add('taskItem');
  }
  for (const extension of extensions) {
    if (names.has(extension.name)) {
      throw new Error(`Duplicate Tiptap extension: ${extension.name}`);
    }
    names.add(extension.name);
  }
  return [
    ...(starterKit ? [StarterKit] : []),
    ...(textAlign
      ? [TextAlign.configure({ types: ['heading', 'paragraph'] })]
      : []),
    ...(taskLists ? [TaskList, TaskItem.configure({ nested: true })] : []),
    ...extensions,
  ];
}
