'use client';

import type {} from '@tiptap/starter-kit';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { EditorToolbar } from '@typseo/ui';
import { Code2, ImagePlus, Link2, Minus, Quote, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface PlaygroundToolbarProps {
  editor: Editor | null;
  onOpenAssistant: () => void;
  disabled?: boolean;
}

export function PlaygroundToolbar({
  editor,
  onOpenAssistant,
  disabled = false,
}: PlaygroundToolbarProps) {
  const [dialog, setDialog] = useState<'link' | 'image' | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const state = useEditorState({
    editor,
    selector: ({ editor: selected }) => {
      const current = selected && !selected.isDestroyed ? selected : null;
      return {
        blockquote: current?.isActive('blockquote') ?? false,
        codeBlock: current?.isActive('codeBlock') ?? false,
        link: current?.isActive('link') ?? false,
      };
    },
  }) ?? {
    blockquote: false,
    codeBlock: false,
    link: false,
  };

  const isDisabled = disabled || !editor;

  function openDialog(next: 'link' | 'image') {
    setUrl(
      next === 'link' ? String(editor?.getAttributes('link').href ?? '') : '',
    );
    setAlt('');
    setError('');
    setDialog(next);
  }

  function submitAsset() {
    if (!editor || !dialog) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol))
        throw new Error('Unsupported protocol');
    } catch {
      setError('Enter a valid https:// or http:// URL.');
      return;
    }
    if (dialog === 'link') {
      editor.chain().focus().setLink({ href: parsed.toString() }).run();
    } else {
      editor
        .chain()
        .focus()
        .setImage({ src: parsed.toString(), alt: alt.trim() })
        .run();
    }
    setDialog(null);
  }

  return (
    <>
      <div
        className="playground-toolbar"
        aria-label="Editor formatting controls"
      >
        <div className="toolbar-scroll">
          <EditorToolbar
            editor={disabled ? null : editor}
            className="sdk-toolbar"
          />
          <div className="toolbar-divider" aria-hidden="true" />
          <div className="toolbar-extras">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Link"
              aria-label="Insert link"
              aria-pressed={state.link}
              disabled={isDisabled}
              onClick={() => openDialog('link')}
            >
              <Link2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Image"
              aria-label="Insert image"
              disabled={isDisabled}
              onClick={() => openDialog('image')}
            >
              <ImagePlus />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Blockquote"
              aria-label="Blockquote"
              aria-pressed={state.blockquote}
              disabled={isDisabled}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Code block"
              aria-label="Code block"
              aria-pressed={state.codeBlock}
              disabled={isDisabled}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            >
              <Code2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Horizontal rule"
              aria-label="Insert horizontal rule"
              disabled={isDisabled}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            >
              <Minus />
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="toolbar-ai"
          onClick={onOpenAssistant}
        >
          <Sparkles className="size-4" />
          AI Assistant
        </Button>
      </div>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === 'image' ? 'Insert image' : 'Insert link'}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'image'
                ? 'Add a public image URL and descriptive alt text.'
                : 'Link the selected text to a web page.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm font-medium" htmlFor="asset-url">
              URL
            </label>
            <Input
              id="asset-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            {dialog === 'image' && (
              <>
                <label
                  className="block text-sm font-medium"
                  htmlFor="image-alt"
                >
                  Alt text
                </label>
                <Input
                  id="image-alt"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  placeholder="Describe the image"
                />
              </>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            {dialog === 'link' && state.link && (
              <Button
                variant="outline"
                onClick={() => {
                  editor?.chain().focus().unsetLink().run();
                  setDialog(null);
                }}
              >
                Remove link
              </Button>
            )}
            <Button onClick={submitAsset}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
