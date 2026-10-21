# Next.js App Router example

Run `pnpm install` at the repository root, then `pnpm --filter @typseo/example-app-router dev`. Open <http://localhost:3002>.

The server page uses `createTypseoMetadata` with the real page title and description. The client editor feeds plain text into `analyzeSeoDocument`, including the visible H1 and block separators. Edits live only in memory; replace this with host-owned persistence. No canonical URL or Article schema is emitted because this example has no deployed origin or real article provenance.
