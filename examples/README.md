# Runnable integrations

From the repository root after `pnpm install --frozen-lockfile`:

| Integration          | Command                                          | Local URL               |
| -------------------- | ------------------------------------------------ | ----------------------- |
| Next.js App Router   | `pnpm --filter @typseo/example-app-router dev`   | <http://localhost:3002> |
| Next.js Pages Router | `pnpm --filter @typseo/example-pages-router dev` | <http://localhost:3003> |
| React + Vite         | `pnpm --filter @typseo/example-vite dev`         | <http://localhost:3004> |

All three examples use local workspace packages. They intentionally do not implement backend storage, authentication, or a real deployment origin. Replace the in-memory draft state and sample content with your application's own data model before production use.
