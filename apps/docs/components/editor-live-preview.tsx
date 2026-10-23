'use client';

import { useState } from 'react';
import { TypseoEditor } from '@typseo/ui';

export function EditorLivePreview() {
  const [html, setHtml] = useState('<p>Start writing with Typseo.</p>');
  return (
    <div className="typseo-preview typseo-editor-preview">
      <div className="typseo-preview-header">
        <span>Live editor · @typseo/ui</span>
        <span>Unsaved local state</span>
      </div>
      <TypseoEditor
        defaultValue="<p>Start writing with Typseo.</p>"
        textAlign
        taskLists
        onChange={setHtml}
        ariaLabel="Try the Typseo editor"
        className="demo-editor"
        toolbarClassName="demo-editor-toolbar"
        contentClassName="demo-editor-content"
      />
      <p className="demo-editor-output">
        Serialized HTML: <code>{html}</code>
      </p>
    </div>
  );
}
