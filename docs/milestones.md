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

## M1 — SEO Core

Acceptance criteria:

- `@typseo/core` defines a framework-independent document snapshot, checks, issue types, and a deterministic weighted score.
- Default rules cover titles, descriptions, body length, heading structure, informative-image alt text, and an optional focus keyword.
- Skipped rules do not affect the score denominator; custom rules can replace the default set.
- Unicode-aware phrase matching avoids substring false positives.
- Unit tests cover passing, failing, skipped, custom, and non-mutating behavior.
- The package builds to ESM with declaration files, and root test, typecheck, lint, format, boundary, and build checks pass.
- Work stays on `feat/seo-core`; do not merge M0 or start M2 as part of this milestone.

M2–M7 follow the product roadmap in the project brief. Editor adapters and React components belong in M2, not M1.
