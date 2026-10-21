export type GuideBlock =
  | { type: 'section'; title: string; text: string }
  | { type: 'code'; label: string; code: string }
  | { type: 'note'; title: string; text: string };

export interface Guide {
  kicker: string;
  title: string;
  description: string;
  blocks: GuideBlock[];
}

export const guideOrder = [
  'getting-started',
  'editor',
  'seo',
  'nextjs',
] as const;

export const guides: Record<string, Guide> = {
  'getting-started': {
    kicker: '01',
    title: 'Get started',
    description:
      'Clone the workspace, run the playground, and understand where each package fits.',
    blocks: [
      {
        type: 'section',
        title: 'Prerequisites',
        text: 'Use Node.js 20.9 or newer and pnpm 10.4.1. Typseo packages are private while the first release is being prepared, so start from the repository rather than a public registry.',
      },
      {
        type: 'code',
        label: 'TERMINAL',
        code: 'git clone https://github.com/typseo/typseo.git\ncd typseo\npnpm install --frozen-lockfile\npnpm dev',
      },
      {
        type: 'section',
        title: 'Open the playground',
        text: 'Visit http://localhost:3000 to edit a local draft and see a live SEO checklist. The playground stores drafts in browser local storage; it does not create accounts or send your content to a hosted Typseo service.',
      },
      {
        type: 'code',
        label: 'MORE APPS',
        code: 'pnpm dev:docs\npnpm --filter @typseo/example-app-router dev\npnpm --filter @typseo/example-pages-router dev\npnpm --filter @typseo/example-vite dev',
      },
      {
        type: 'note',
        title: 'Choose your layer',
        text: 'Use @typseo/core for framework-independent analysis, @typseo/react for a headless Tiptap hook, @typseo/ui for optional components, and @typseo/next for App Router metadata. Your app owns persistence, auth, styling, and deployment.',
      },
    ],
  },
  editor: {
    kicker: '02',
    title: 'The editor',
    description:
      'Start with a headless hook or the unstyled editor shell. Your application controls content and presentation.',
    blocks: [
      {
        type: 'section',
        title: 'Drop in an editor',
        text: 'TypseoEditor combines the Tiptap-backed hook, editable region, and an accessible formatting toolbar. Supply host CSS through the className props. The component runs on the client; it does not fetch or persist content.',
      },
      {
        type: 'code',
        label: 'CLIENT COMPONENT / TSX',
        code: '\'use client\';\n\nimport { TypseoEditor } from \'@typseo/ui\';\n\nexport function ArticleEditor() {\n  return (\n    <TypseoEditor\n      defaultValue="<p>Start writing</p>"\n      onChange={(html) => console.log(html)}\n      ariaLabel="Article body"\n      className="article-editor"\n    />\n  );\n}',
      },
      {
        type: 'section',
        title: 'Control the document',
        text: 'Pass value for a controlled editor or defaultValue for an uncontrolled editor. onChange receives serialized HTML and the Tiptap editor instance. For custom toolbars, import useTypseoEditor from @typseo/react and render EditorContent yourself.',
      },
      {
        type: 'note',
        title: 'SSR and performance',
        text: 'The hook initializes the editor only on the client to avoid hydration mismatches and does not rerender React on every editor transaction. Keep extension instances stable, and debounce expensive parent-side analysis if needed.',
      },
    ],
  },
  seo: {
    kicker: '03',
    title: 'SEO analysis',
    description:
      'Analyze a page snapshot, not raw editor HTML. The result is deterministic and independent of your UI.',
    blocks: [
      {
        type: 'section',
        title: 'Build the reader-visible snapshot',
        text: 'The title is the actual page title, not necessarily the first H1. bodyText is the complete visible body text, including headings, with block boundaries preserved. Provide headings and images in rendered order. Do not pass editor markup directly as bodyText.',
      },
      {
        type: 'code',
        label: 'TYPESCRIPT',
        code: "import { analyzeSeoDocument } from '@typseo/core';\n\nconst analysis = analyzeSeoDocument({\n  title: 'A clear page title',\n  metaDescription: 'A useful summary for readers.',\n  bodyText: 'A clear page title\\nThe complete visible article text…',\n  headings: [{ level: 1, text: 'A clear page title' }],\n});\n\nconsole.log(analysis.score, analysis.issues);",
      },
      {
        type: 'section',
        title: 'Render the checks',
        text: 'The optional @typseo/ui/seo components display an existing analysis; they do not secretly recalculate it. The score is a weighted percentage of applicable rules. Skipped rules do not count toward the denominator. A SERP preview is illustrative, not a guarantee of search-engine presentation.',
      },
      {
        type: 'note',
        title: 'Own your SEO policy',
        text: 'The default rule set covers titles, descriptions, body length, headings, image alt text, and an optional focus keyword. Replace it with custom SeoRule implementations when your publishing context calls for different checks.',
      },
    ],
  },
  nextjs: {
    kicker: '04',
    title: 'Next.js integration',
    description:
      'Generate App Router metadata server-side, then keep the interactive editor in a client component.',
    blocks: [
      {
        type: 'section',
        title: 'App Router metadata',
        text: '@typseo/next creates metadata from the page title and description. Optional canonical and image URLs must be absolute HTTP(S) URLs. Keep the metadata source in your server-side content model, not solely in browser local storage.',
      },
      {
        type: 'code',
        label: 'APP/PAGE.TSX',
        code: "import { createTypseoMetadata } from '@typseo/next';\n\nconst page = {\n  title: 'A useful article',\n  metaDescription: 'A concise summary for readers.',\n};\n\nexport const metadata = createTypseoMetadata({\n  document: page,\n  // canonicalUrl: 'https://your-real-site.example/article',\n});",
      },
      {
        type: 'section',
        title: 'Pages Router',
        text: 'The Next.js helper targets App Router Metadata. In Pages Router, use next/head and map the same page title and description explicitly. The runnable Pages Router example demonstrates this without importing @typseo/next.',
      },
      {
        type: 'note',
        title: 'Structured data',
        text: 'createArticleJsonLd and serializeJsonLd can generate script-safe Article JSON-LD. Only pass real author, date, image, and canonical fields. Do not fabricate a production origin or metadata to make a demo look complete.',
      },
    ],
  },
};
