import Link from 'next/link';

const modules = [
  {
    number: '01',
    title: 'Write',
    text: 'A headless Tiptap v3 adapter and optional, unstyled React components.',
    href: '/guides/editor',
    tag: '@typseo/react',
  },
  {
    number: '02',
    title: 'Analyze',
    text: 'Deterministic SEO rules built around an editor-independent page snapshot.',
    href: '/guides/seo',
    tag: '@typseo/core',
  },
  {
    number: '03',
    title: 'Publish',
    text: 'App Router metadata and JSON-LD helpers with validated URLs.',
    href: '/guides/nextjs',
    tag: '@typseo/next',
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          DEVELOPER DOCUMENTATION / 2026
        </p>
        <h1>
          Write better.
          <br />
          <span>Ship smarter.</span>
        </h1>
        <p className="hero-copy">
          The composable rich-text editor and SEO toolkit for React and Next.js.
          Bring your own interface, keep your own content, and publish with
          clarity.
        </p>
        <div className="hero-actions">
          <Link className="button button-dark" href="/guides/getting-started">
            Start building <span>↗</span>
          </Link>
          <a
            className="button button-light"
            href="https://github.com/typseo/typseo"
          >
            View source <span>↗</span>
          </a>
        </div>
        <div className="hero-meta">
          <span>OPEN SOURCE / MIT</span>
          <span>REACT + NEXT.JS</span>
          <span>NO HOSTED SERVICE REQUIRED</span>
        </div>
      </section>
      <section className="section-block" aria-labelledby="building-blocks">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE TOOLKIT</p>
            <h2 id="building-blocks">Small pieces. Your stack.</h2>
          </div>
          <span className="section-index">01 / OVERVIEW</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <Link
              href={module.href}
              className="module-card"
              key={module.number}
            >
              <span className="module-number">
                {module.number} / {module.tag}
              </span>
              <h3>
                {module.title}
                <span>↗</span>
              </h3>
              <p>{module.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="section-block quickstart"
        aria-labelledby="quickstart"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIRST STEPS</p>
            <h2 id="quickstart">From clone to canvas.</h2>
          </div>
          <span className="section-index">02 / WORKSPACE</span>
        </div>
        <div className="terminal">
          <div className="terminal-bar">
            <span className="terminal-dots">● ● ●</span>
            <span>terminal / typseo</span>
          </div>
          <pre>
            <code>
              <span>$</span> git clone https://github.com/typseo/typseo.git
              {'\n'}
              <span>$</span> cd typseo && pnpm install{'\n'}
              <span>$</span> pnpm dev
            </code>
          </pre>
        </div>
        <p className="small-note">
          Packages have not been published yet. Use the workspace and{' '}
          <Link href="/examples">runnable examples</Link> until M7.
        </p>
      </section>
    </>
  );
}
