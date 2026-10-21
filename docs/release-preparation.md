# Public beta release preparation

This is a preparation checklist, not authorization to publish. All seven `@typseo/*` packages remain `private: true`; no npm release workflow is enabled. The package owner must approve the first public versions and npm namespace before those gates are changed.

## Current automated gate

Run `pnpm install --frozen-lockfile` and `pnpm release:check` from the repository root. The command builds the workspace and uses `npm pack --dry-run --json --ignore-scripts` for each package. It verifies that the README, MIT license text, package manifest, and every declared JS/type export are actually in the prospective tarball; it rejects agent-control and environment files. CI runs the artifact check after its production build. This is a dry run: it neither creates tarballs nor sends content to npm.

The packages have explicit ESM exports and declaration paths. `@typseo/ahrefs` and `@typseo/gsc` export only `./server`. The CI boundary script keeps every package private and enforces those paths until a separate reviewed release change deliberately updates that policy.

## Owner decisions and manual setup

1. Confirm control of the `@typseo` npm scope and decide the first public beta versions and exact package set. Check name availability before removing `private: true`.
2. Add a Changeset for each intended first-release package, review generated versions/changelogs, and verify workspace dependency ranges in packed manifests. Publish core dependencies before dependents, or use a release tool with proven ordering.
3. Configure an [npm trusted publisher](https://docs.npmjs.com/trusted-publishers/) for the exact GitHub repository and release workflow. Use a protected GitHub environment with required reviewers; avoid a long-lived npm publish token. npm's current trusted-publisher requirements include Node 22.14+ and npm CLI 11.5.1+.
4. Review `pnpm audit --prod`, the full development dependency audit, license text, package contents, CI logs, and real example installs from tarballs. Do not treat a green application build as proof that packed packages install correctly.
5. Only then add and review a manual, environment-gated publishing workflow. Publish beta-tagged versions first, verify the npm registry artifacts and provenance, install them in fresh consumer projects, and announce the exact compatibility/support status. Never automatically publish on a push to `main`.

## Findings on 2026-10-21

- `pnpm audit --prod` reported no known vulnerabilities. The full audit reported one high-severity `braces` and one moderate `sprintf-js` advisory through the development-only Changesets dependency graph; the audit showed no patched versions. Recheck advisories before release and avoid untrusted inputs to the release tooling.
- The React/Vite example builds but Vite reports an approximately 637 kB minified editor chunk (about 202 kB gzip) and ignores React Server Component `use client` directives, which have no meaning in Vite. Measure the consumer bundle and typing latency before claiming performance targets.
- GitHub Actions currently emits notices about Node 20-based action runtimes and an upcoming `ubuntu-latest` image migration. These are not failing checks but should be refreshed/tested before release.

## If a beta must be withdrawn

npm versions cannot be silently replaced. Stop the workflow, deprecate the affected version with a precise reason, fix forward with a new version, and publish a security advisory when appropriate. Do not assume a git revert removes already published tarballs.
