# Typseo documentation

The existing Next.js App Router app in `apps/docs` now uses Fumadocs MDX and Tailwind CSS v4. It documents the current workspace packages, which remain private until release approval.

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev:docs
```

Open <http://localhost:3001>. The root path redirects to `/docs`. Search is self-hosted at `/api/search`.

Set `NEXT_PUBLIC_DOCS_SITE_URL` to the **real deployed origin** when deploying. Without it, `robots.txt` disallows indexing and `sitemap.xml` is empty, avoiding accidental canonical URLs on localhost or an unknown host. Never add a fake origin merely to populate a sitemap.

Content lives in `content/docs`; each section has a `meta.json` to control navigation. MDX components are registered in `components/mdx.tsx`. The live SEO example in `components/seo-live-preview.tsx` uses real `@typseo/core` and `@typseo/ui` exports. The repository-root `docs/` directory remains as original technical and milestone notes; it is not deleted.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build`, `pnpm boundaries`, and `pnpm security:tracked` before a PR.
