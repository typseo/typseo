import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('local AI demo endpoint', () => {
  it('is disabled by default without contacting a provider', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/ai/edit', {
        method: 'POST',
        headers: {
          Origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: 'clarity', text: 'A passage' }),
      }),
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'AI demo is disabled.' });
  });
});
