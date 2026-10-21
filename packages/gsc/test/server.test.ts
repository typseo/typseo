import { describe, expect, it, vi } from 'vitest';
import { createGscClient, GscApiError } from '../src/server.js';

describe('Search Console adapter', () => {
  it('queries a URL-prefix property with a server-resolved OAuth token', async () => {
    const getAccessToken = vi.fn().mockResolvedValue('test-token');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        rows: [
          {
            keys: ['seo'],
            clicks: 10,
            impressions: 100,
            ctr: 0.1,
            position: 3.5,
          },
        ],
      }),
    );
    const client = createGscClient({ getAccessToken, fetcher });
    const rows = await client.querySearchAnalytics({
      siteUrl: 'https://example.com/',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      dimensions: ['query'],
      rowLimit: 10,
    });
    expect(rows[0]).toMatchObject({ keys: ['seo'], clicks: 10, ctr: 0.1 });
    const [url, options] = fetcher.mock.calls[0] ?? [];
    expect(String(url)).toContain(
      'https%3A%2F%2Fexample.com%2F/searchAnalytics/query',
    );
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer test-token',
    });
    expect(JSON.parse(String(options?.body))).toMatchObject({
      dimensions: ['query'],
      rowLimit: 10,
    });
  });

  it('supports domain properties and empty rows', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({}));
    const client = createGscClient({
      getAccessToken: () => 'test-token',
      fetcher,
    });
    expect(
      await client.querySearchAnalytics({
        siteUrl: 'sc-domain:example.com',
        startDate: '2026-02-01',
        endDate: '2026-02-02',
      }),
    ).toEqual([]);
    expect(String(fetcher.mock.calls[0]?.[0])).toContain(
      'sc-domain%3Aexample.com',
    );
  });

  it('validates dates and dimensions before resolving the token', async () => {
    const getAccessToken = vi.fn().mockReturnValue('test-token');
    const client = createGscClient({ getAccessToken, fetcher: vi.fn() });
    await expect(
      client.querySearchAnalytics({
        siteUrl: 'https://example.com/',
        startDate: '2026-02-30',
        endDate: '2026-03-01',
      }),
    ).rejects.toThrow('date range');
    await expect(
      client.querySearchAnalytics({
        siteUrl: 'https://example.com/',
        startDate: '2026-02-01',
        endDate: '2026-03-01',
        dimensions: ['query', 'query'],
      }),
    ).rejects.toThrow('dimensions');
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('exposes rate-limit status and rejects invalid response rows', async () => {
    const rateLimited = createGscClient({
      getAccessToken: () => 'test-token',
      fetcher: vi
        .fn()
        .mockResolvedValue(
          new Response('', { status: 429, headers: { 'Retry-After': '30' } }),
        ),
    });
    const query = {
      siteUrl: 'https://example.com/',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
    };
    const failure = await rateLimited
      .querySearchAnalytics(query)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(GscApiError);
    expect(failure).toMatchObject({ status: 429, retryAfter: '30' });
    const malformed = createGscClient({
      getAccessToken: () => 'test-token',
      fetcher: vi
        .fn()
        .mockResolvedValue(Response.json({ rows: [{ keys: [], clicks: -1 }] })),
    });
    await expect(malformed.querySearchAnalytics(query)).rejects.toThrow();
  });
});
