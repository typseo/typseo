# Optional external integrations (M5)

M5 adds two independent server-only adapters. They do not run in the Playground by default and are not part of an editor or browser bundle. Both packages are available as public betas on npm. No live provider request is made during repository tests.

## Ahrefs keyword overview

`@typseo/ahrefs/server` calls the [Ahrefs API v3 Keywords Explorer Overview](https://docs.ahrefs.com/en/api/reference/keywords-explorer/get-overview) endpoint with a host-supplied key. It requests only `keyword`, `volume`, and `difficulty` for 1–10 keywords in one two-letter country. A result may be absent or have null metrics; it must not be interpreted as a guarantee that Ahrefs has data for every requested keyword.

```ts
import { createAhrefsClient } from '@typseo/ahrefs/server';

const client = createAhrefsClient({ apiKey: getServerSecret() });
const rows = await client.keywordOverview({
  keywords: ['seo toolkit'],
  country: 'US',
  signal: AbortSignal.timeout(10_000),
});
```

Ahrefs requests can consume API units. The host should require an authenticated user action, set its own budget and per-user limits, cache appropriate results, and review [Ahrefs API limits and key controls](https://docs.ahrefs.com/en/api/docs/api-keys-creation-and-management) before enabling it. The adapter does not retry automatically. On upstream errors, `AhrefsApiError` exposes `status` and `retryAfter` without including the credential.

## Google Search Console analytics

`@typseo/gsc/server` calls the [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) endpoint. The host provides an OAuth access-token resolver; Typseo does not implement consent, token storage, refresh, or account linking. Use the read-only `https://www.googleapis.com/auth/webmasters.readonly` scope unless a different host use case explicitly requires more. The authenticated account needs access to the requested property.

```ts
import { createGscClient } from '@typseo/gsc/server';

const client = createGscClient({
  getAccessToken: () => getCurrentServerSideOAuthToken(),
});
const rows = await client.querySearchAnalytics({
  siteUrl: 'sc-domain:example.com',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  dimensions: ['query'],
  rowLimit: 100,
  signal: AbortSignal.timeout(10_000),
});
```

The adapter validates dates, property, dimensions, and pagination; an empty `rows` response becomes `[]`. It intentionally does not claim a complete export. Search Console can return only top rows, has a 25,000-row per-request limit, and applies [load and request quotas](https://developers.google.com/webmaster-tools/limits). The host owns paging, caching, scheduling, permission checks, and privacy policy. `GscApiError` exposes `status` and `retryAfter` for controlled backoff; there is no hidden retry.

For both integrations, keep credentials on the server, never use `NEXT_PUBLIC_` values, avoid logging tokens, and do not proxy these methods directly to unauthenticated browser requests. BYOK means the host manages the user's key or OAuth grant securely; these adapters do not create a credential vault.
