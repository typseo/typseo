# Editor & React SDK (M2)

`@typseo/react` is a headless Tiptap v3 adapter. `@typseo/ui` is optional: it provides an editor shell and accessible toolbar, but no CSS. Both packages remain private while the project is under development.

## Hook

```tsx
'use client';

import { EditorContent } from '@tiptap/react';
import { useTypseoEditor } from '@typseo/react';

export function MyEditor() {
  const editor = useTypseoEditor({
    defaultValue: '<p>Start writing</p>',
    onChange: (html) => console.log(html),
  });

  return <EditorContent editor={editor} />;
}
```

Pass `value` instead of `defaultValue` for a controlled editor. External `value` changes replace the document without echoing `onChange`. `onChange` receives serialized HTML and the Tiptap editor instance after document changes. `editable` can be toggled. `editorProps` passes through to Tiptap. The hook returns `null` until initialization on the client, which avoids Next.js SSR hydration mismatches.

StarterKit supplies the default editing schema and common commands. Pass `extensions` to add or configure Tiptap extensions; keep extension instances stable across renders. Pass `starterKit: false` only when providing a complete schema yourself. If an extension configuration changes after mount, Tiptap recreates the editor; avoid changing it during active editing.

```tsx
import Placeholder from '@tiptap/extension-placeholder';

const extensions = [Placeholder.configure({ placeholder: 'Write here…' })];
const editor = useTypseoEditor({ extensions });
```

The optional placeholder extension in this example must be installed by the host app. Typseo does not include it by default.

## Components

```tsx
'use client';

import { TypseoEditor } from '@typseo/ui';

export function ArticleBody() {
  return (
    <TypseoEditor
      defaultValue="<p>Draft</p>"
      ariaLabel="Article body"
      className="article-editor"
      toolbarClassName="article-toolbar"
      contentClassName="article-content"
    />
  );
}
```

`TypseoEditor` accepts the hook options plus `className`, `toolbarClassName`, `contentClassName`, `ariaLabel`, and `showToolbar`. `EditorToolbar` is separately exported for use with a headless editor instance. Buttons expose accessible labels, pressed state, and disabled state. Host CSS owns focus, contrast, spacing, and typography; `apps/playground` shows one theme.

The hook does not run SEO analysis, AI, or network requests. It opts out of transaction-driven React rerenders. A controlled parent can still rerender on each `onChange`; debounce expensive parent-side work. Bundle size and typing latency have not yet been benchmarked.
