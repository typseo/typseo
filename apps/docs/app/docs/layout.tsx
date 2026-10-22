import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '../../lib/source';
import type { ReactNode } from 'react';
import Link from 'next/link';

const playgroundUrl =
  process.env.NEXT_PUBLIC_PLAYGROUND_URL ??
  'https://typseo-playground.vercel.app';

function Brand() {
  return (
    <Link href="/" className="typseo-logo" aria-label="Typseo home">
      <span className="typseo-logo-mark">t</span>typseo{' '}
      <span className="typseo-logo-sub">/ docs</span>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{ title: <Brand /> }}
      githubUrl="https://github.com/typseo/typseo"
      links={[
        {
          text: 'Playground',
          url: playgroundUrl,
          external: true,
        },
      ]}
      sidebar={{ collapsible: true }}
      tabs={false}
    >
      {children}
    </DocsLayout>
  );
}
