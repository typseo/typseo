# Playground

Run `pnpm install && pnpm dev`, then open <http://localhost:3000>. This Next.js app is a local, interactive host for the Typseo SDK—not a hosted SaaS product.

The layout follows three work areas: documents and navigation, the Tiptap editor, and SEO analysis. Below 900 px, navigation becomes a drawer and Editor/Analysis switch through a bottom bar. The theme toggle switches between light and dark and is remembered locally.

## Try the workflow

1. Edit the page title, meta description, or article body. The score, checklist, keyword checks, outline, readability metrics, and SERP preview respond to the document. SEO analysis runs after a short pause while typing in the editor, not synchronously on each keystroke.
2. Open **Content Brief** to edit the title, description, focus keyword, and preview URL slug. The slug is not a core SEO rule.
3. Use the toolbar to format text, insert a link or public image URL, add a list or blockquote, and undo/redo. An inserted image's alt text contributes to the real SEO check.
4. Select text and open **AI Assistant**. Choose a writing task or enter a custom instruction. The AI demo is disabled by default; when configured for local development, review the suggestion before accepting or rejecting it.
5. Create more documents, search by title, switch among them, preview read-only, or export HTML/JSON. Drafts persist in this browser's local storage. Clear site storage to remove them.

The SEO Score is returned by `analyzeSeoDocument` from `@typseo/core`; the playground adapts the Tiptap document to the core's editor-independent snapshot. The sample article scores according to the same rules as user-created documents. Readability displays transparent counts (words, sentences, words per sentence, estimated reading time), not an unimplemented readability grade. SERP preview is illustrative; search engines may show other snippets.

This app uses Tailwind CSS v4, shadcn/ui primitives, and Lucide icons. These dependencies remain in the playground, not the core or React SDK packages. The browser stores drafts locally and does not sync them between devices. For AI demo configuration, privacy, and production limitations, see [AI integration](ai-integration.md).
