# Dependency security review

As of 2026-10-22, GitHub reports a high-severity [advisory for `braces` versions through 3.0.3](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). npm lists 3.0.3 as the newest release, and the advisory names no patched version. We have not dismissed the [repository alert](https://github.com/typseo/typseo/security/dependabot/1).

`pnpm why braces -r` traces the dependency through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. Each path starts from a **devDependency** in the private docs, playground, or Next.js example apps. The seven published `@typseo/*` package manifests do not depend on this chain. GitHub labels the lockfile alert as runtime; the workspace dependency tree gives the more precise scope.

The vulnerable code runs in development and CI linting, so maintainers still need to watch the advisory. We should not override `braces` with an unrelated version or claim the issue is fixed. Dependabot checks weekly; when upstream publishes a patched version, update the lockfile, run the full checks, inspect the packed packages, and close the alert through the normal dependency update.
