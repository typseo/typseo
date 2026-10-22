# Contributing

Typseo publishes seven packages under the `@typseo` npm scope. We review changes through pull requests to `main`. Create a branch named `feat/*`, `fix/*`, `refactor/*`, `perf/*`, `docs/*`, or `chore/*`, and use a Conventional Commit such as `fix(core): handle empty headings`.

For a change to a public package, run `pnpm changeset` and describe the user-facing effect. A docs-only or tooling-only PR does not need a Changeset. Do not edit package versions by hand; the release workflow prepares a version PR after a Changeset reaches `main`.

Before committing, stage specific paths, inspect `git diff --cached --name-only` and `git diff --cached`, then run `pnpm security:staged`. Never commit coding-agent instructions, local implementation plans, credentials, or real environment files. The check is a safety net; inspect the diff yourself as well.

Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm format:check`, `pnpm boundaries`, `pnpm security:tracked`, and `pnpm security:history` before opening a PR. For changes to package exports or dependencies, also run `pnpm release:check`. Maintainers review PRs before merging; a merge does not publish a package.
