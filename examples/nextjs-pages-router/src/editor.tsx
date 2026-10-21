import { analyzeSeoDocument } from '@typseo/core';
import { TypseoEditor } from '@typseo/ui';
import { useState } from 'react';

export function Editor({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [bodyText, setBodyText] = useState(
    `${title}\nStart writing your article here.`,
  );
  const analysis = analyzeSeoDocument({
    title,
    metaDescription: description,
    bodyText,
    headings: [{ level: 1, text: title }],
  });
  return (
    <div className="workspace">
      <section>
        <h2>Article draft</h2>
        <TypseoEditor
          ariaLabel="Article draft"
          defaultValue="<p>Start writing your article here.</p>"
          onChange={(_, editor) =>
            setBodyText(`${title}\n${editor.getText({ blockSeparator: '\n' })}`)
          }
          className="editor"
        />
        <p className="hint">
          Edits are in-memory only. Your host app should provide persistence.
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
  );
}
