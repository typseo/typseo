export interface PlaygroundDocument {
  id: string;
  title: string;
  metaDescription: string;
  focusKeyword: string;
  slug: string;
  html: string;
  updatedAt: number;
}

export const sampleDocument: PlaygroundDocument = {
  id: 'sample-seo-guide',
  title: 'A Practical Guide to SEO for SaaS Teams',
  metaDescription:
    'Learn how to build a practical SEO strategy for SaaS teams, from audience research and useful content to better page structure and sustainable growth.',
  focusKeyword: 'SEO for SaaS',
  slug: 'seo-for-saas-teams',
  html: `<h2>Understand your audience</h2>
<p>SEO for SaaS starts with a clear picture of the people you want to reach. Learn what they are trying to solve, the language they use, and the questions they ask before they compare products. A useful article should answer those questions directly, not just repeat a keyword.</p>
<p>Talk to customers, review support conversations, and map the problems they face at each stage of their journey. This research gives your team a stronger foundation than a list of search terms alone.</p>
<h2>Build a focused content strategy</h2>
<p>Choose topics where your product knowledge can add something genuinely helpful. Group related articles around a clear theme, give each page a specific purpose, and connect them with relevant internal links. A focused structure makes the site easier to navigate for readers and search engines.</p>
<ul><li><p>Start with real customer questions and product use cases.</p></li><li><p>Write a clear page title and description for every article.</p></li><li><p>Review and improve content as the product changes.</p></li></ul>
<h2>Measure what matters</h2>
<p>Publishing is only the start. Watch whether the right readers find the page and whether it helps them take a useful next step. Measure search visibility alongside engagement, trial signups, and the quality of the conversations your content creates.</p>`,
  updatedAt: 0,
};

export function makeNewDocument(): PlaygroundDocument {
  return {
    id: crypto.randomUUID(),
    title: '',
    metaDescription: '',
    focusKeyword: '',
    slug: '',
    html: '<p></p>',
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
