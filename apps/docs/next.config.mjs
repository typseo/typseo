import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/guides/getting-started',
        destination: '/docs/introduction/quick-start',
        permanent: true,
      },
      {
        source: '/guides/editor',
        destination: '/docs/editor/tiptap-editor',
        permanent: true,
      },
      {
        source: '/guides/seo',
        destination: '/docs/seo-toolkit/seo-engine',
        permanent: true,
      },
      {
        source: '/guides/nextjs',
        destination: '/docs/integrations/nextjs',
        permanent: true,
      },
      { source: '/examples', destination: '/docs/examples', permanent: true },
    ];
  },
};

export default withMDX(config);
