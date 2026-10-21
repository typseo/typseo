import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import * as StepsComponents from 'fumadocs-ui/components/steps';
import * as FilesComponents from 'fumadocs-ui/components/files';
import type { MDXComponents } from 'mdx/types';
import { SeoLivePreview } from './seo-live-preview';
import { DocsHero } from './docs-hero';
import { EditorLivePreview } from './editor-live-preview';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...StepsComponents,
    ...FilesComponents,
    SeoLivePreview,
    DocsHero,
    EditorLivePreview,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
