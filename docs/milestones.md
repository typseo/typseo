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

## M4 — AI Integration

Acceptance criteria:

- `@typseo/ai` validates bounded edit requests and exposes a provider-agnostic server contract and an HTTPS OpenAI-compatible adapter.
- No provider key, model, or server adapter is imported by client UI; provider calls are opt-in and never run in tests.
- Reusable AI command, custom-instruction, and accept/reject preview components remain host-stylable.
- Playground applies accepted suggestions as plain text only when the selected passage and document are unchanged. Rejection never modifies the editor.
- The example Route Handler is disabled by default and in production; local opt-in requires server-only environment variables and a same-origin JSON request.
- Tests cover validation, provider responses using an injected transport, UI review controls, and stale-selection protection.
- Root install, typecheck, lint, test, format, boundary, security, and build checks pass.

## M5 — External Integrations

Acceptance criteria:

- Optional `@typseo/ahrefs/server` requests a bounded keyword overview with a host-supplied API key; no live requests run in tests.
- Optional `@typseo/gsc/server` requests Search Analytics with a host-supplied OAuth token resolver and validates property, dates, dimensions, and pagination.
- Both adapters normalize limited response fields, surface upstream status and `Retry-After`, and do not silently retry or imply complete provider data.
- Only server entrypoints are exported; neither adapter enters the client import graph or requires the editor or core package.
- Docs explain credentials, OAuth, costs, quotas, privacy, and host-owned production controls.
- Root install, typecheck, lint, test, format, boundary, security, and build checks pass.

## M6 — Documentation & Examples

Acceptance criteria:

- A standalone, responsive documentation site covers setup, editor integration, SEO snapshots, Next.js metadata, and runnable examples.
- Next.js App Router, Next.js Pages Router, and React/Vite examples use workspace packages and build independently.
- Examples distinguish server-rendered metadata from client-side editor state; they do not invent canonical URLs, production persistence, or structured-data provenance.
- Root frozen install, typecheck, lint, test, format, boundary, security, and production build checks pass with the new apps included in the workspace.
- Work is reviewed in a PR before merge. Package publication remains M7 work.
