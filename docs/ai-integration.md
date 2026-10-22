# Optional AI editing (M4)

`@typseo/ai` validates bounded edit requests and defines a provider-agnostic `AiProvider` contract. Its `@typseo/ai/server` subpath contains an HTTPS OpenAI-compatible chat-completions adapter. Import that subpath **only in trusted server code**; never pass a provider API key to React components or use a `NEXT_PUBLIC_` variable for it. The package is published as a beta on npm.

The UI components in `@typseo/ui/ai` are controlled and unstyled: `AICommandMenu`, `AIChatPanel` (a custom-instruction input), and `AIChangesPreview`. The host owns generation, loading/error state, and the editor change. The returned text is a proposal, not trusted HTML. Review before applying it.

In the Playground, select text in the editor and open AI Assistant. The default route `/api/ai/edit` returns 503 and never contacts a provider. To try the local development demo, set these **server-side** environment variables and restart `pnpm dev`:

```text
TYPSEO_AI_DEMO_ENABLED=true
TYPSEO_AI_API_KEY=<your provider key>
TYPSEO_AI_MODEL=<your provider model>
TYPSEO_AI_ENDPOINT=<optional HTTPS chat-completions endpoint>
```

Only enable the demo if you authorize the provider's cost and data processing: selected text and its title/keyword context are sent to the configured provider. No credentials are saved in documents or sent to the browser. Do not commit the environment file. The demo endpoint only runs in development, requires same-origin JSON POST requests, bounds request and output size, uses a 20-second timeout, and disables response caching. It is **not** a production authentication or quota solution. A production host must add its own authentication, authorization, rate limits, abuse controls, audit policy, and privacy disclosures before exposing its own endpoint.

Accepted suggestions replace the originally selected range only if the active document and passage are still unchanged. The editor inserts plain text, not model-generated HTML. Rejecting a suggestion leaves the document untouched. AI output can be incorrect; the user remains responsible for review.
