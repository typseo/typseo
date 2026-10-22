import { resolveExtensions, type AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export interface TypseoPresetOptions {
  /** Disable StarterKit only when supplying a complete replacement schema. */
  starterKit?: boolean;
  extensions?: AnyExtension[];
}

const starterKitNames = new Set(
  resolveExtensions([StarterKit]).map((extension) => extension.name),
);

/** Build one editor schema without registering the same extension twice. */
export function createTypseoPreset({
  starterKit = true,
  extensions = [],
}: TypseoPresetOptions = {}): AnyExtension[] {
  const names = new Set<string>(starterKit ? starterKitNames : []);
  for (const extension of extensions) {
    if (names.has(extension.name)) {
      throw new Error(`Duplicate Tiptap extension: ${extension.name}`);
    }
    names.add(extension.name);
  }
  return starterKit ? [StarterKit, ...extensions] : [...extensions];
}
