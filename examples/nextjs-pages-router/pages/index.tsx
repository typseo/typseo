import Head from 'next/head';
import dynamic from 'next/dynamic';

const Editor = dynamic(
  () => import('../src/editor').then((module) => module.Editor),
  { ssr: false },
);
const page = {
  title: 'A practical guide to thoughtful content',
  metaDescription:
    'A Pages Router example with a Typseo editor and live SEO analysis.',
};

export default function Home() {
  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.metaDescription} />
      </Head>
      <main>
        <p className="overline">TYPSEO / PAGES ROUTER EXAMPLE</p>
        <h1>{page.title}</h1>
        <p>{page.metaDescription}</p>
        <Editor title={page.title} description={page.metaDescription} />
        <p className="hint">
          This page owns its metadata through next/head. The editor runs only in
          the browser; no App Router metadata helper is imported.
        </p>
      </main>
    </>
  );
}
