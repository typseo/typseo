import { createTypseoMetadata } from '@typseo/next';
import { DraftEditor } from './draft-editor';

const page = {
  title: 'A practical guide to thoughtful content',
  metaDescription:
    'An App Router example with a Typseo editor and live SEO analysis.',
};
export const metadata = createTypseoMetadata({ document: page });

export default function Page() {
  return (
    <main>
      <p className="overline">TYPSEO / APP ROUTER EXAMPLE</p>
      <h1>{page.title}</h1>
      <p>{page.metaDescription}</p>
      <DraftEditor title={page.title} description={page.metaDescription} />
      <p className="hint">
        Metadata above is generated on the server. The editor and analysis below
        run in the browser. Add your real canonical URL only when deploying to
        your own domain.
      </p>
    </main>
  );
}
