# Public beta releases

All seven `@typseo/*` packages were published to npm as `0.1.0-beta.0` on 2026-10-21. The initial release was published interactively by the `neongodev` npm organization owner. The registry currently points both `beta` and `latest` to that first beta; npm rejected an attempt to remove `latest` (HTTP 400). Treat the packages as prereleases and pin exact versions in consumers.

## Release flow

1. Add a Changeset to a PR that changes a public package: `pnpm changeset`. Choose the affected packages and a semver bump. Non-package changes do not need a Changeset.
2. After that PR merges into `main`, [Prepare npm release PR](../.github/workflows/release-version.yml) runs `pnpm release:version`, updates package versions and changelogs, and opens/updates a version PR. The workflow explicitly dispatches CI for that PR because a PR created with `GITHUB_TOKEN` does not trigger `pull_request` workflows on its own.
3. Review the version PR, its CI result, and the changelogs. Merge only when the release contents are correct. A merge that changes `packages/*/package.json` triggers [Stage npm beta release](../.github/workflows/release-stage.yml).
4. The release workflow runs security, boundaries, formatting, typecheck, lint, tests, a production build, tarball inspection, and a packed-consumer smoke test. A verification job uploads the tarballs. A separate job with OIDC permission stages only versions absent from the public registry, in dependency order. Staging does **not** make a new version installable.
5. On npmjs.com, inspect each staged tarball and approve it with 2FA. Approve internal dependencies before dependents (`core`, `ai`, `react` before `next` and `ui`). npm's publish-time malware scan may delay public availability. Verify every version, the `beta` dist-tag, and a clean install from the registry before announcing a release.

The version PR and npm approvals are deliberate human gates. Pushing a source change or merely merging a feature PR does not publish it. The workflow does not store an npm write token or use one to bypass 2FA.

## One-time trusted publisher setup

Once the workflow is merged into `main`, configure a trusted publisher on **each** of the seven npm packages. Use the exact GitHub organization `typseo`, repository `typseo`, and workflow filename `release-stage.yml`. Leave the environment name empty because the workflow does not declare a GitHub environment. Allow **stage publish only**; do not enable direct `npm publish` or dist-tag management. [npm's trusted publisher guide](https://docs.npmjs.com/trusted-publishers/) documents the same fields and OIDC requirement.

With npm CLI 11.21.0 or newer, an owner can do the equivalent from a logged-in terminal:

```bash
npm trust github @typseo/core --repo typseo/typseo --file release-stage.yml --allow-stage-publish
```

Repeat for `ai`, `ahrefs`, `gsc`, `react`, `next`, and `ui`. npm requests 2FA for the first trust change and can offer a short approval window for the remaining packages. Do not send OTPs or npm tokens to CI. Once trusted publishing has been validated, consider requiring 2FA and disallowing traditional tokens in each package's publishing settings.

**Timing:** npm expires an unvalidated trusted-publisher configuration if it does not complete its first successful publish within two days. Configure trust shortly before the next actual beta release is ready to stage; do not set it up weeks early. Until then, the release workflow is prepared but cannot stage a new version. No release is created solely to validate trust.

GitHub repository Actions settings must allow Actions to create pull requests for the automatic version PR. The version workflow needs `contents: write`, `pull-requests: write`, and `actions: write` to open the PR and dispatch its CI; the staging job alone gets `id-token: write`.

## Local checks and recovery

Run `pnpm install --frozen-lockfile` and `pnpm release:check` from the root before reviewing a version PR. The latter builds the workspace, inspects every prospective tarball for README, license, exports, and prohibited files, then installs all packed packages into a temporary consumer and imports every public entrypoint. CI performs the same checks. The release checks accept future `x.y.z-beta.N` versions and verify exact internal dependency versions after `pnpm pack` rewrites `workspace:*` ranges.

If staging fails after some packages were staged, inspect the npm Staged Packages queue before rerunning the workflow; a staged version reserves its version number. If a public beta is defective, do not try to overwrite its version. Deprecate it with a precise reason, fix forward with a new version, and publish a security advisory when appropriate.
