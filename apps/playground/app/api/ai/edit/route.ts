import { validateAiEditRequest } from '@typseo/ai';
import { createOpenAiCompatibleProvider } from '@typseo/ai/server';

export const runtime = 'nodejs';

function json(body: object, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** Local-only opt-in example. Production applications must provide authentication and rate limits. */
export async function POST(request: Request) {
  const secret = process.env.TYPSEO_AI_API_KEY;
  const model = process.env.TYPSEO_AI_MODEL;
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.TYPSEO_AI_DEMO_ENABLED !== 'true' ||
    !secret ||
    !model
  )
    return json({ error: 'AI demo is disabled.' }, 503);

  if (request.headers.get('origin') !== new URL(request.url).origin)
    return json({ error: 'Invalid request origin.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return json({ error: 'Expected JSON.' }, 415);
  if (Number(request.headers.get('content-length')) > 16_000)
    return json({ error: 'Request is too large.' }, 413);

  const raw = await request.text();
  if (raw.length > 16_000) return json({ error: 'Request is too large.' }, 413);
  let input;
  try {
    input = validateAiEditRequest(JSON.parse(raw));
  } catch {
    return json({ error: 'Invalid AI edit request.' }, 400);
  }

  try {
    const provider = createOpenAiCompatibleProvider({
      apiKey: secret,
      model,
      ...(process.env.TYPSEO_AI_ENDPOINT
        ? { endpoint: process.env.TYPSEO_AI_ENDPOINT }
        : {}),
    });
    const result = await provider.generateEdit(
      input,
      AbortSignal.timeout(20_000),
    );
    return json(result, 200);
  } catch {
    return json({ error: 'AI suggestion could not be generated.' }, 502);
  }
}
