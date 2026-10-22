import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HomeThemeToggle } from '../components/home-theme-toggle';
import './home.css';

const playgroundUrl =
  process.env.NEXT_PUBLIC_PLAYGROUND_URL ??
  'https://typseo-playground.vercel.app';

export const metadata: Metadata = {
  title: 'Typseo — The editor with SEO built in',
  description:
    'An open-source rich-text editor and SEO toolkit for React and Next.js. Write, analyze, and ship content in your own app.',
  openGraph: {
    title: 'Typseo — The editor with SEO built in',
    description: 'An open-source editor and SEO toolkit for React and Next.js.',
    images: ['/images/playground-overview.png'],
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="home-arrow">
      {diagonal ? '↗' : '→'}
    </span>
  );
}

export default function Home() {
  return (
    <div className="home-shell">
      <header className="home-header">
        <Link className="home-brand" href="/" aria-label="Typseo home">
          <span className="home-brand-mark" aria-hidden="true">
            t
          </span>
          <span>typseo</span>
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <Link href="/docs">Docs</Link>
          <a href={playgroundUrl}>Playground</a>
          <a
            href="https://github.com/typseo/typseo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <Arrow diagonal />
          </a>
        </nav>
        <a className="home-header-cta" href={playgroundUrl}>
          Open Playground <Arrow diagonal />
        </a>
        <HomeThemeToggle />
      </header>

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-eyebrow">
            <span className="home-status-dot" /> OPEN SOURCE · PUBLIC BETA
          </div>
          <h1 id="home-title">An editor that understands your content.</h1>
          <p className="home-lead">
            Rich-text editing and practical SEO feedback, built to live inside
            your React app. Own the experience, the workflow, and the content.
          </p>
          <div className="home-actions">
            <a className="home-button home-button-primary" href={playgroundUrl}>
              Try the Playground <Arrow />
            </a>
            <Link className="home-button home-button-secondary" href="/docs">
              Read the docs <Arrow />
            </Link>
          </div>
          <p className="home-hero-note">
            No account required. Playground drafts stay in this browser.
          </p>
        </section>

        <section
          className="home-preview"
          aria-label="Typseo Playground preview"
        >
          <div className="home-preview-bar">
            <span>
              <span className="home-preview-live" /> THE PLAYGROUND
            </span>
            <a href={playgroundUrl}>
              Explore it yourself <Arrow diagonal />
            </a>
          </div>
          <a
            className="home-preview-image-link"
            href={playgroundUrl}
            aria-label="Open the interactive Typseo Playground"
          >
            <Image
              src="/images/playground-overview.png"
              width={1440}
              height={900}
              alt="Typseo Playground showing a document editor beside a live SEO score and checklist"
              priority
              sizes="(max-width: 760px) 960px, (max-width: 1440px) 100vw, 1440px"
            />
          </a>
        </section>

        <section
          className="home-section home-workflow"
          aria-labelledby="workflow-title"
        >
          <div className="home-section-heading">
            <p className="home-kicker">ONE WORKFLOW</p>
            <h2 id="workflow-title">Write with the signal in sight.</h2>
            <p>
              Keep editorial work and SEO checks together, without moving
              content between tools.
            </p>
          </div>
          <div className="home-workflow-grid">
            <article className="home-feature">
              <span className="home-feature-index">01 / EDIT</span>
              <h3>A real writing surface</h3>
              <p>
                A Tiptap-based editor with a toolbar, document outline,
                previews, and local drafts in the Playground.
              </p>
            </article>
            <article className="home-feature">
              <span className="home-feature-index">02 / ANALYZE</span>
              <h3>Feedback as you write</h3>
              <p>
                Editor-independent SEO scoring, a clear checklist, and metadata
                and search-result previews.
              </p>
            </article>
            <article className="home-feature">
              <span className="home-feature-index">03 / INTEGRATE</span>
              <h3>Build it your way</h3>
              <p>
                Use the core analysis package on its own, or compose the React
                UI and Next.js metadata helpers.
              </p>
            </article>
          </div>
        </section>

        <section
          className="home-section home-developer"
          aria-labelledby="developer-title"
        >
          <div>
            <p className="home-kicker">MADE FOR DEVELOPERS</p>
            <h2 id="developer-title">
              A toolkit, not another place to publish.
            </h2>
            <p>
              Typseo gives you packages for analysis, editing, UI, and
              integrations. Your app decides where content is stored and how it
              gets published.
            </p>
            <Link
              className="home-text-link"
              href="/docs/introduction/installation"
            >
              Explore the packages <Arrow />
            </Link>
          </div>
          <div className="home-code" aria-label="Install Typseo packages">
            <div className="home-code-top">
              <span>TERMINAL</span>
              <span>pnpm</span>
            </div>
            <pre>
              <code>
                <span className="home-code-prompt">$ </span>
                {
                  'pnpm add \\\n  @typseo/core@0.1.0-beta.1 \\\n  @typseo/react@0.1.0-beta.1 \\\n  @typseo/ui@0.1.0-beta.1'
                }
              </code>
            </pre>
            <p>Public beta · Pin exact versions for production use.</p>
          </div>
        </section>

        <section
          className="home-section home-beta"
          aria-labelledby="beta-title"
        >
          <span className="home-beta-tag">PUBLIC BETA</span>
          <div>
            <h2 id="beta-title">Open code. Honest limits.</h2>
            <p>
              The Playground saves drafts only in your browser; it has no
              account or cross-device sync. AI suggestions are an opt-in local
              development demo, not a hosted production service. The seven{' '}
              <code>@typseo/*</code> packages are public betas and APIs may
              change.
            </p>
          </div>
          <a
            className="home-text-link"
            href="https://github.com/typseo/typseo"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <Arrow diagonal />
          </a>
        </section>

        <section className="home-final" aria-labelledby="final-title">
          <p className="home-kicker">START EXPLORING</p>
          <h2 id="final-title">See the editor in action.</h2>
          <p>
            Open a sample document, try the editor, and watch the SEO checklist
            respond.
          </p>
          <div className="home-actions">
            <a className="home-button home-button-primary" href={playgroundUrl}>
              Open Playground <Arrow />
            </a>
            <Link className="home-button home-button-secondary" href="/docs">
              Browse documentation <Arrow />
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Link className="home-brand" href="/" aria-label="Typseo home">
          <span className="home-brand-mark" aria-hidden="true">
            t
          </span>
          <span>typseo</span>
        </Link>
        <p>Open-source editor and SEO toolkit for React.</p>
        <nav aria-label="Footer navigation">
          <Link href="/docs">Docs</Link>
          <a href={playgroundUrl}>Playground</a>
          <a href="https://github.com/typseo/typseo">GitHub</a>
          <a href="https://www.npmjs.com/org/typseo">npm</a>
        </nav>
      </footer>
    </div>
  );
}
