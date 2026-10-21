export type AiCommand = 'clarity' | 'shorten' | 'seo' | 'custom';

export interface AiEditRequest {
  command: AiCommand;
  text: string;
  instruction?: string;
  context?: { title?: string; focusKeyword?: string };
}

export interface AiEditResult {
  replacement: string;
}

/** Validate untrusted input before it reaches a paid provider. */
export function validateAiEditRequest(value: unknown): AiEditRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError('Expected an AI edit request object.');
  const input = value as Record<string, unknown>;
  if (!['clarity', 'shorten', 'seo', 'custom'].includes(String(input.command)))
    throw new TypeError('Unsupported AI command.');
  if (
    typeof input.text !== 'string' ||
    !input.text.trim() ||
    input.text.length > 10_000
  )
    throw new TypeError('Text must contain 1–10,000 characters.');
  if (
    input.instruction !== undefined &&
    (typeof input.instruction !== 'string' || input.instruction.length > 1_000)
  )
    throw new TypeError('Instruction must be at most 1,000 characters.');
  if (
    input.command === 'custom' &&
    (typeof input.instruction !== 'string' || !input.instruction.trim())
  )
    throw new TypeError('Custom AI command requires an instruction.');
  let context: AiEditRequest['context'];
  if (input.context !== undefined) {
    if (
      !input.context ||
      typeof input.context !== 'object' ||
      Array.isArray(input.context)
    )
      throw new TypeError('Invalid AI context.');
    const candidate = input.context as Record<string, unknown>;
    for (const field of ['title', 'focusKeyword']) {
      const item = candidate[field];
      if (item !== undefined && (typeof item !== 'string' || item.length > 200))
        throw new TypeError(`Invalid ${field}.`);
    }
    context = {
      ...(typeof candidate.title === 'string'
        ? { title: candidate.title }
        : {}),
      ...(typeof candidate.focusKeyword === 'string'
        ? { focusKeyword: candidate.focusKeyword }
        : {}),
    };
  }
  return {
    command: input.command as AiCommand,
    text: input.text,
    ...(typeof input.instruction === 'string'
      ? { instruction: input.instruction }
      : {}),
    ...(context ? { context } : {}),
  };
}
