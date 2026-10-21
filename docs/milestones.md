# Milestones

## M0 — Repository Foundation

Acceptance criteria:

- pnpm workspace and Turborepo task graph are configured.
- A shared strict TypeScript base is configured; the playground is typechecked. Future package source must inherit this base.
- Lint, format, test, typecheck, and build commands complete.
- Package manifests establish module boundaries without claiming unfinished APIs.
- A minimal Next.js App Router playground runs locally.
- PR CI checks code and rejects prohibited tracked files or obvious secrets.
- A staged-file checker is available through the pre-commit hook.
- Work is committed on `feat/bootstrap-monorepo`; no push or merge is part of M0.

## Next

M1 implements the framework-independent SEO document model, scoring rules, issue types, and unit tests in `@typseo/core`. M2–M7 follow the product roadmap in the project brief; no M1 implementation belongs in M0.
