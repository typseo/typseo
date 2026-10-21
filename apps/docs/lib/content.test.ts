import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../content/docs/', import.meta.url));
const sections = [
  'introduction',
  'editor',
  'seo-toolkit',
  'components',
  'ai-integration',
  'integrations',
  'api-reference',
  'examples',
];

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(dir, entry.name);
    if (entry.isDirectory()) return pages(location);
    return entry.name.endsWith('.mdx') ? [location] : [];
  });
}

describe('documentation content', () => {
  it('contains all eight sections and their listed pages', () => {
    const navigation = JSON.parse(
      readFileSync(path.join(root, 'meta.json'), 'utf8'),
    ) as { pages: string[] };
    expect(navigation.pages).toEqual(['index', ...sections]);
    for (const section of sections) {
      expect(
        readFileSync(path.join(root, section, 'index.mdx'), 'utf8'),
      ).toMatch(/^---\n/);
      const meta = JSON.parse(
        readFileSync(path.join(root, section, 'meta.json'), 'utf8'),
      ) as { pages: string[] };
      for (const slug of meta.pages) {
        expect(existsSync(path.join(root, section, slug + '.mdx'))).toBe(true);
      }
    }
  });

  it('keeps internal documentation links resolvable', () => {
    for (const file of pages(root)) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(
        /\]\(\/(docs(?:\/[a-z0-9/-]+)?)\)/g,
      )) {
        const linkedPath = match[1];
        if (!linkedPath) continue;
        const relative = linkedPath === 'docs' ? 'index' : linkedPath.slice(5);
        const target = path.join(root, relative);
        expect(
          existsSync(target + '.mdx') ||
            existsSync(path.join(target, 'index.mdx')),
        ).toBe(true);
      }
    }
  });
});
