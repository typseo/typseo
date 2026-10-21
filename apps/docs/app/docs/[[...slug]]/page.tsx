import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { source } from '../../../lib/source';
import { getMDXComponents } from '../../../components/mdx';

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc} full={page.slugs.length === 0}>
      {page.slugs.length > 0 && <DocsTitle>{page.data.title}</DocsTitle>}
      {page.slugs.length > 0 && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    ...(process.env.NEXT_PUBLIC_DOCS_SITE_URL
      ? { alternates: { canonical: page.url } }
      : {}),
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
    },
  };
}
