import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { analyzeSeoDocument } from '@typseo/core';
import { TypseoEditor } from '@typseo/ui';
import './styles.css';

function App() {
  const [title, setTitle] = useState('A practical guide to thoughtful content');
  const [description, setDescription] = useState(
    'A React/Vite example with a Typseo editor and live SEO analysis.',
  );
  const [editorText, setEditorText] = useState(
    'Start writing your article here.',
  );
  const analysis = analyzeSeoDocument({
    title,
    metaDescription: description,
    bodyText: `${title}\n${editorText}`,
    headings: [{ level: 1, text: title }],
  });
  return (
    <main>
      <p className="overline">TYPSEO / REACT + VITE EXAMPLE</p>
      <h1>{title}</h1>
      <p>
        Framework-free editing and analysis. The title and description below are
        host-owned state.
      </p>
      <div className="workspace">
        <section>
          <label htmlFor="title">Page title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor="description">Meta description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
          />
          <h2>Article body</h2>
          <TypseoEditor
            ariaLabel="Article body"
            defaultValue="<p>Start writing your article here.</p>"
            onChange={(_, editor) =>
              setEditorText(editor.getText({ blockSeparator: '\n' }))
            }
            className="editor"
          />
          <p className="hint">
            This example stores state in memory only. The browser tab title is
            static; wire your publishing system to generate real page metadata
            from the saved title and description.
          </p>
        </section>
        <aside aria-label="SEO analysis">
          <span className="overline">LIVE ANALYSIS</span>
          <strong className="score">
            {analysis.score}
            <small>/100</small>
          </strong>
          <p>
            {analysis.issues.length} issue
            {analysis.issues.length === 1 ? '' : 's'} to review
          </p>
          <ul>
            {analysis.issues.map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
