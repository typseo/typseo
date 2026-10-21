# Architecture boundaries

Typseo is a library suite intended for existing React, Next.js App Router, Next.js Pages Router, and React/Vite applications. Packages will be independently installable when implemented. M0 created private package shells. M1 implements `@typseo/core`; M2 adds `@typseo/react` and editor components in `@typseo/ui`; M3 adds reusable SEO UI and `@typseo/next`; M4 adds opt-in AI editing. These five packages have built public entry points but remain private until release approval. Ahrefs and GSC still explicitly export nothing and contain no product APIs or build targets.

| Package          | Planned responsibility                              | Earliest milestone |
| ---------------- | --------------------------------------------------- | ------------------ |
| `@typseo/core`   | Framework-independent document model and SEO engine | M1                 |
| `@typseo/react`  | Headless React and Tiptap integration               | M2                 |
| `@typseo/ui`     | Optional reusable components                        | M2/M3              |
| `@typseo/ai`     | Server-side AI integration and review model         | M4                 |
| `@typseo/next`   | Next.js metadata and schema helpers                 | M3                 |
| `@typseo/ahrefs` | Optional Ahrefs BYOK adapter                        | M5                 |
| `@typseo/gsc`    | Optional Search Console adapter                     | M5                 |

Dependency direction: `core` has no React, Tiptap, Next.js, provider SDK, or integration dependency. React and UI may depend on core; Next.js, AI, Ahrefs, and GSC remain optional. Server-only credentials must never enter a client import graph. `@typseo/ai` exports request types at its root and the provider adapter only at `@typseo/ai/server`; client UI uses only the root types. Cross-package imports must use declared package dependencies and public exports, not relative paths into another package's source.

The Next.js playground under `apps/playground` is a development host. It is not an SDK package and does not define production component behavior. Its `/seo-example` route demonstrates M3 integration without adding a separately deployed app. A standalone documentation site and broader examples remain scheduled for M6.

The M1 engine analyzes a plain, editor-independent document snapshot synchronously. The M2 editor does not run SEO analysis on transactions; adapters must schedule or debounce it outside the keystroke hot path. The editor delays initialization until the client and opts out of transaction-driven React rerenders. These choices are not a substitute for bundle or typing-performance benchmarks, which remain future work. `@typseo/ui` supplies structure and controls but leaves visual styling to the host application. M3's static SEO view components live at `@typseo/ui/seo`; controlled client-side metadata forms live at `@typseo/ui/metadata-editor`. `@typseo/next` uses only core types and Next.js metadata types, not Tiptap or UI code.
