import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, guideOrder, type GuideBlock } from '../../../lib/guides';

export function generateStaticParams() {
  return guideOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  return guide ? { title: guide.title, description: guide.description } : {};
}

function Block({ block }: { block: GuideBlock }) {
  if (block.type === 'code')
    return (
      <div className="code-panel">
        <div className="code-label">{block.label}</div>
        <pre>
          <code>{block.code}</code>
        </pre>
      </div>
    );
  if (block.type === 'note')
    return (
      <div className="callout">
        <strong>{block.title}</strong>
        <p>{block.text}</p>
      </div>
    );
  return (
    <section className="guide-section">
      <h2>{block.title}</h2>
      <p>{block.text}</p>
    </section>
  );
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) notFound();
  const nextIndex = guideOrder.findIndex((item) => item === slug) + 1;
  const nextSlug = guideOrder[nextIndex];
  return (
    <article className="guide-page">
      <p className="eyebrow">GUIDES / {guide.kicker}</p>
      <h1>{guide.title}</h1>
      <p className="guide-lead">{guide.description}</p>
      <div className="guide-divider" />
      {guide.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
      <div className="guide-next">
        <span>KEEP EXPLORING</span>
        {nextSlug ? (
          <Link href={`/guides/${nextSlug}`}>{guides[nextSlug]?.title} ↗</Link>
        ) : (
          <Link href="/examples">Runnable examples ↗</Link>
        )}
      </div>
    </article>
  );
}
