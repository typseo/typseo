import type { JSONContent } from '@tiptap/core';

export interface PlaygroundDocument {
  schemaVersion: 2;
  id: string;
  title: string;
  metaDescription: string;
  focusKeyword: string;
  slug: string;
  content: JSONContent;
  updatedAt: number;
}

export const sampleDocument: PlaygroundDocument = {
  schemaVersion: 2,
  id: 'sample-seo-guide',
  title: 'A Practical Guide to SEO for SaaS Teams',
  metaDescription:
    'Learn how to build a practical SEO strategy for SaaS teams, from audience research and useful content to better page structure and sustainable growth.',
  focusKeyword: 'SEO for SaaS',
  slug: 'seo-for-saas-teams',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Understand your audience' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'SEO for SaaS starts with a clear picture of the people you want to reach. Learn what they are trying to solve, the language they use, and the questions they ask before they compare products. A useful article should answer those questions directly, not just repeat a keyword.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Talk to customers, review support conversations, and map the problems they face at each stage of their journey. This research gives your team a stronger foundation than a list of search terms alone.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Build a focused content strategy' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Choose topics where your product knowledge can add something genuinely helpful. Group related articles around a clear theme, give each page a specific purpose, and connect them with relevant internal links. A focused structure makes the site easier to navigate for readers and search engines.',
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Start with real customer questions and product use cases.',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Write a clear page title and description for every article.',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Review and improve content as the product changes.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Measure what matters' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Publishing is only the start. Watch whether the right readers find the page and whether it helps them take a useful next step. Measure search visibility alongside engagement, trial signups, and the quality of the conversations your content creates.',
          },
        ],
      },
    ],
  },
  updatedAt: 0,
};

export function makeNewDocument(): PlaygroundDocument {
  return {
    schemaVersion: 2,
    id: crypto.randomUUID(),
    title: '',
    metaDescription: '',
    focusKeyword: '',
    slug: '',
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    updatedAt: Date.now(),
  };
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
