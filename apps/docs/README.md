# Typseo documentation

The Next.js App Router app in `apps/docs` uses Fumadocs MDX and Tailwind CSS v4. It documents the seven public beta packages and their current APIs.

Production: <https://typseo-docs.vercel.app/docs>.

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev:docs
```

Open <http://localhost:3001>. The root path redirects to `/docs`. Search is self-hosted at `/api/search`.

Set `NEXT_PUBLIC_DOCS_SITE_URL` to the **real deployed origin** when deploying. Without it, `robots.txt` disallows indexing and `sitemap.xml` is empty, avoiding accidental canonical URLs on localhost or an unknown host. Never add a fake origin merely to populate a sitemap.

## Deploy on Vercel

Import `typseo/typseo` as one Vercel project and set its Root Directory to `apps/docs`. Keep the Next.js framework preset and choose Node.js 22. The local [`vercel.json`](vercel.json) runs Turbo from the workspace so `@typseo/core`, `@typseo/react`, and `@typseo/ui` build before the docs app. It does not deploy the playground or examples.

After the first deployment gives you a stable production origin, set `NEXT_PUBLIC_DOCS_SITE_URL` for the Production environment to that origin, such as the assigned `https://<project>.vercel.app` URL, and redeploy. Leave this variable unset for previews unless each preview has its own exact origin. Check `/docs`, `/api/search`, `/robots.txt`, and `/sitemap.xml` on the deployed host before linking to it from the repository.

Content lives in `content/docs`; each section has a `meta.json` to control navigation. MDX components are registered in `components/mdx.tsx`. The live SEO example in `components/seo-live-preview.tsx` uses real `@typseo/core` and `@typseo/ui` exports. The repository-root `docs/` directory remains as original technical and milestone notes; it is not deleted.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build`, `pnpm boundaries`, and `pnpm security:tracked` before a PR.
