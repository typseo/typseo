import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '../../lib/source';
import type { ReactNode } from 'react';

function Brand() {
  return (
    <span className="typseo-logo">
      <span className="typseo-logo-mark">t</span>typseo{' '}
      <span className="typseo-logo-sub">/ docs</span>
    </span>
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
          url: 'https://github.com/typseo/typseo/tree/main/apps/playground',
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
