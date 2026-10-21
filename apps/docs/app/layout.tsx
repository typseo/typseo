import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './styles.css';

export const metadata: Metadata = {
  title: { default: 'Typseo Docs', template: '%s · Typseo Docs' },
  description:
    'Guides and runnable examples for the embeddable Typseo editor and SEO toolkit.',
};

const navigation = [
  { href: '/guides/getting-started', label: 'Get started' },
  { href: '/guides/editor', label: 'Editor' },
  { href: '/guides/seo', label: 'SEO' },
  { href: '/guides/nextjs', label: 'Next.js' },
  { href: '/examples', label: 'Examples' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/" aria-label="Typseo Docs home">
              <span className="brand-mark">
                t<span>.</span>
              </span>
              <span>
                typseo <span className="brand-suffix">/ docs</span>
              </span>
            </Link>
            <nav className="top-nav" aria-label="Primary navigation">
              <Link href="/guides/getting-started">Guides</Link>
              <Link href="/examples">Examples</Link>
              <a href="https://github.com/typseo/typseo">GitHub ↗</a>
            </nav>
          </header>
          <div className="content-shell">
            <aside className="sidebar" aria-label="Documentation navigation">
              <div className="sidebar-group">
                <span className="sidebar-caption">DOCUMENTATION</span>
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="sidebar-note">
                <span className="status-dot" />
                In active development
                <p>
                  Packages are private until the first release. Run the examples
                  from this workspace.
                </p>
              </div>
            </aside>
            <main id="main" className="main-content">
              {children}
            </main>
          </div>
          <footer className="site-footer">
            <span>Typseo · Open-source editor & SEO toolkit</span>
            <a href="https://github.com/typseo/typseo/blob/main/LICENSE">
              MIT License ↗
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
