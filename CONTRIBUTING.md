# Contributing

Use `main` for reviewed, stable work. Create a branch named `feat/*`, `fix/*`, `refactor/*`, `perf/*`, `docs/*`, or `chore/*`. Use Conventional Commits, for example `chore(repo): configure CI`.

The current milestone is M0. Do not add product functionality from later milestones in an M0 change.

Before committing, stage specific paths, inspect `git diff --cached --name-only` and `git diff --cached`, then run `pnpm security:staged`. Never commit coding-agent instructions, local implementation plans, credentials, or real environment files. The check is a safety net; inspect the diff yourself as well.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm boundaries` before opening a PR. Do not push or merge without project-owner approval.
