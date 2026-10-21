import { EditorDemo } from './editor-demo';

export default function Home() {
  return (
    <main className="workspace">
      <header className="siteHeader">
        <div className="brand">
          <span className="brandMark">T</span>
          <span>Typseo</span>
        </div>
        <span className="headerMeta">
          Editor playground <span aria-hidden="true">/</span> M2
        </span>
      </header>

      <section className="workspaceIntro" aria-labelledby="page-title">
        <p className="eyebrow">React SDK · Tiptap v3</p>
        <h1 id="page-title">A focused space to write.</h1>
        <p>
          Try the embeddable editor and its formatting controls. The SDK stays
          headless; this playground supplies the theme.
        </p>
      </section>

      <EditorDemo />

      <footer className="siteFooter">
        <span>Typseo is an open-source editor toolkit.</span>
        <a
          href="https://github.com/typseo/typseo"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
