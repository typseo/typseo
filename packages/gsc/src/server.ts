export type SearchDimension = 'date' | 'query' | 'page' | 'country' | 'device';

export interface SearchAnalyticsRequest {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: SearchDimension[];
  rowLimit?: number;
  startRow?: number;
  signal?: AbortSignal;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscClientOptions {
  /** Resolve a current OAuth token server-side for each request. */
  getAccessToken: () => Promise<string> | string;
  fetcher?: typeof fetch;
}

export class GscApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly retryAfter: string | null,
  ) {
    super(`Search Console request failed (${status}).`);
    this.name = 'GscApiError';
  }
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

function validProperty(value: string): boolean {
  if (/^sc-domain:[a-z0-9.-]+$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function finiteMetric(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error(`Invalid Search Console ${field} value.`);
  return value;
}

/** Server-only Search Analytics adapter; host owns OAuth consent and token storage. */
export function createGscClient({
  getAccessToken,
  fetcher = fetch,
}: GscClientOptions) {
  if (typeof getAccessToken !== 'function')
    throw new TypeError('A server-side OAuth token resolver is required.');

  return {
    async querySearchAnalytics(
      request: SearchAnalyticsRequest,
    ): Promise<SearchAnalyticsRow[]> {
      const {
        siteUrl,
        startDate,
        endDate,
        dimensions = [],
        rowLimit = 1000,
        startRow = 0,
        signal,
      } = request;
      if (!validProperty(siteUrl))
        throw new TypeError('Invalid Search Console property.');
      if (!validDate(startDate) || !validDate(endDate) || startDate > endDate)
        throw new TypeError('Invalid Search Console date range.');
      if (
        !Array.isArray(dimensions) ||
        new Set(dimensions).size !== dimensions.length ||
        dimensions.some(
          (item) =>
            !['date', 'query', 'page', 'country', 'device'].includes(item),
        )
      )
        throw new TypeError('Invalid Search Console dimensions.');
      if (
        !Number.isInteger(rowLimit) ||
        rowLimit < 1 ||
        rowLimit > 25_000 ||
        !Number.isInteger(startRow) ||
        startRow < 0
      )
        throw new TypeError('Invalid Search Console pagination.');

      const token = await getAccessToken();
      if (!token.trim())
        throw new TypeError('Search Console OAuth token is required.');
      const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      const response = await fetcher(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
        }),
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      });
      if (!response.ok)
        throw new GscApiError(
          response.status,
          response.headers.get('retry-after'),
        );
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object')
        throw new Error('Invalid Search Console response.');
      const rows = (payload as { rows?: unknown }).rows;
      if (rows === undefined) return [];
      if (!Array.isArray(rows)) throw new Error('Invalid Search Console rows.');
      return rows.map((value: unknown) => {
        if (!value || typeof value !== 'object')
          throw new Error('Invalid Search Console row.');
        const row = value as Record<string, unknown>;
        if (
          !Array.isArray(row.keys) ||
          row.keys.length !== dimensions.length ||
          row.keys.some((key) => typeof key !== 'string')
        )
          throw new Error('Invalid Search Console row keys.');
        const ctr = finiteMetric(row.ctr, 'ctr');
        if (ctr > 1) throw new Error('Invalid Search Console ctr value.');
        return {
          keys: row.keys as string[],
          clicks: finiteMetric(row.clicks, 'clicks'),
          impressions: finiteMetric(row.impressions, 'impressions'),
          ctr,
          position: finiteMetric(row.position, 'position'),
        };
      });
    },
  };
}
