'use client';

import { TypseoEditor } from '@typseo/ui';
import { useRef, useState } from 'react';

const initialContent =
  '<h2>Start with an idea</h2><p>Write something worth sharing. Select text to format it, or use the toolbar above.</p>';

export function EditorDemo() {
  const htmlRef = useRef(initialContent);
  const [copyStatus, setCopyStatus] = useState('');

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(htmlRef.current);
      setCopyStatus('HTML copied to clipboard');
    } catch {
      setCopyStatus('Clipboard unavailable in this browser');
    }
  }

  return (
    <section className="editorCard" aria-label="Editor demonstration">
      <div className="editorCardHeader">
        <div>
          <span className="documentLabel">Untitled document</span>
          <span className="documentHint">Local playground · not saved</span>
        </div>
        <button className="copyButton" type="button" onClick={copyHtml}>
          Copy HTML
        </button>
      </div>
      <TypseoEditor
        className="typseoEditor"
        toolbarClassName="editorToolbar"
        contentClassName="editorContent"
        ariaLabel="Document content"
        defaultValue={initialContent}
        onChange={(html) => {
          htmlRef.current = html;
          setCopyStatus('');
        }}
      />
      <div className="editorCardFooter" aria-live="polite">
        {copyStatus || 'Your changes stay in this browser session.'}
      </div>
    </section>
  );
}
