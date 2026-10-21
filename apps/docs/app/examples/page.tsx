import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Runnable examples',
  description: 'Three integration examples for Next.js and React.',
};

const examples = [
  {
    title: 'Next.js App Router',
    stack: 'NEXT.JS 16 / APP ROUTER',
    path: 'examples/nextjs-app-router',
    text: 'Client-side editor, live SEO analysis and server-generated metadata.',
  },
  {
    title: 'Next.js Pages Router',
    stack: 'NEXT.JS 16 / PAGES ROUTER',
    path: 'examples/nextjs-pages-router',
    text: 'Editor and SEO checks with explicit next/head metadata. No App Router helper required.',
  },
  {
    title: 'React + Vite',
    stack: 'REACT 19 / VITE',
    path: 'examples/react-vite',
    text: 'A framework-free integration with an editor, snapshot and live score.',
  },
];

export default function ExamplesPage() {
  return (
    <div className="guide-page">
      <p className="eyebrow">EXAMPLES / REFERENCE APPS</p>
      <h1>See it in context.</h1>
      <p className="guide-lead">
        Each example is a runnable workspace package. Choose the integration
        that matches your app, then adapt the host-owned state and styling.
      </p>
      <div className="guide-divider" />
      <div className="example-list">
        {examples.map((example, index) => (
          <a
            key={example.path}
            href={`https://github.com/typseo/typseo/tree/main/${example.path}`}
            className="example-row"
          >
            <span className="example-index">0{index + 1}</span>
            <span>
              <small>{example.stack}</small>
              <strong>{example.title}</strong>
              <span className="example-description">{example.text}</span>
              <code>{example.path}</code>
            </span>
            <span className="example-arrow">↗</span>
          </a>
        ))}
      </div>
      <div className="callout">
        <strong>Before the first release</strong>
        <p>
          Run these examples inside the monorepo with pnpm. Published package
          installation instructions will follow once package exports and release
          automation are finalized.
        </p>
      </div>
    </div>
  );
}
