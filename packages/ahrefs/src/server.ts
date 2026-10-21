export interface AhrefsKeywordMetric {
  keyword: string;
  volume: number | null;
  difficulty: number | null;
}

export interface AhrefsClientOptions {
  apiKey: string;
  fetcher?: typeof fetch;
}

export interface KeywordOverviewRequest {
  keywords: string[];
  country: string;
  signal?: AbortSignal;
}

export class AhrefsApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly retryAfter: string | null,
  ) {
    super(`Ahrefs request failed (${status}).`);
    this.name = 'AhrefsApiError';
  }
}

function nullableMetric(value: unknown, field: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error(`Invalid Ahrefs ${field} value.`);
  return value;
}

/** Server-only BYOK adapter; requests may consume Ahrefs API units. */
export function createAhrefsClient({
  apiKey,
  fetcher = fetch,
}: AhrefsClientOptions) {
  if (!apiKey.trim()) throw new TypeError('Ahrefs API key is required.');

  return {
    async keywordOverview({
      keywords,
      country,
      signal,
    }: KeywordOverviewRequest): Promise<AhrefsKeywordMetric[]> {
      if (
        !Array.isArray(keywords) ||
        keywords.length < 1 ||
        keywords.length > 10 ||
        keywords.some(
          (keyword) =>
            typeof keyword !== 'string' ||
            !keyword.trim() ||
            keyword.length > 100 ||
            keyword.includes(','),
        )
      )
        throw new TypeError('Provide 1–10 nonempty keywords without commas.');
      if (!/^[a-z]{2}$/i.test(country))
        throw new TypeError('Country must be a two-letter code.');

      const url = new URL(
        'https://api.ahrefs.com/v3/keywords-explorer/overview',
      );
      url.searchParams.set('select', 'keyword,volume,difficulty');
      url.searchParams.set(
        'keywords',
        keywords.map((keyword) => keyword.trim()).join(','),
      );
      url.searchParams.set('country', country.toLowerCase());
      url.searchParams.set('limit', String(keywords.length));
      const response = await fetcher(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
        ...(signal ? { signal } : {}),
      });
      if (!response.ok)
        throw new AhrefsApiError(
          response.status,
          response.headers.get('retry-after'),
        );
      const payload: unknown = await response.json();
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('keywords' in payload) ||
        !Array.isArray(payload.keywords)
      )
        throw new Error('Invalid Ahrefs response.');
      return payload.keywords.map((row: unknown) => {
        if (
          !row ||
          typeof row !== 'object' ||
          !('keyword' in row) ||
          typeof row.keyword !== 'string'
        )
          throw new Error('Invalid Ahrefs keyword row.');
        const metric = row as Record<string, unknown>;
        return {
          keyword: metric.keyword as string,
          volume: nullableMetric(metric.volume, 'volume'),
          difficulty: nullableMetric(metric.difficulty, 'difficulty'),
        };
      });
    },
  };
}
