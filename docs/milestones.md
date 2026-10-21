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

M3–M7 follow the product roadmap in the project brief. Editor adapters and React components belong in M2, not M1.

## M2 — Tiptap & React SDK

Acceptance criteria:

- `@typseo/react` exposes a headless Tiptap v3 hook with controlled and uncontrolled HTML, change callbacks, editable state, and consumer extensions.
- The hook avoids transaction-driven React rerenders and uses client-only editor initialization for SSR safety.
- `@typseo/ui` exposes optional, unstyled `TypseoEditor` and `EditorToolbar` components with accessible formatting controls.
- The Next.js playground exercises the editor without coupling SDK styling to the host app.
- Hook tests cover content updates, controlled synchronization, custom extensions, and stable editor identity.
- Root test, typecheck, lint, format, boundary, security, and build checks pass.
- Work stays on `feat/editor-react-sdk`; M3 SEO UI and Next.js helpers are not part of this milestone.

## M3 — SEO UI & Next.js

Acceptance criteria:

- `@typseo/ui/seo` exposes reusable, unstyled `SEOScore`, `SEOChecklist`, `SERPPreview`, and `SEOSidebar` components consuming real `@typseo/core` analysis and document data.
- `@typseo/ui/metadata-editor` exposes controlled page metadata and focus-keyword inputs without storing host state.
- `@typseo/next` creates App Router metadata and Article JSON-LD with validated absolute URLs and script-safe serialization.
- The Playground has a real App Router example route using the package APIs without fabricated canonical URLs or schema fields.
- Tests cover score rendering, checklist interaction, controlled metadata editing, metadata output, unsafe URLs, and JSON-LD serialization.
- Root install, typecheck, lint, test, format, boundary, security, and build checks pass; AI and external integrations remain out of scope.
