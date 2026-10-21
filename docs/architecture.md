# Architecture boundaries

Typseo is a library suite intended for existing React, Next.js App Router, Next.js Pages Router, and React/Vite applications. Packages will be independently installable when implemented. M0 created private package shells. M1 implements `@typseo/core` with a built public entry point while keeping it private until release approval. The remaining packages still explicitly export nothing and contain no product APIs or build targets.

| Package          | Planned responsibility                              | Earliest milestone |
| ---------------- | --------------------------------------------------- | ------------------ |
| `@typseo/core`   | Framework-independent document model and SEO engine | M1                 |
| `@typseo/react`  | Headless React and Tiptap integration               | M2                 |
| `@typseo/ui`     | Optional reusable components                        | M2/M3              |
| `@typseo/ai`     | Server-side AI integration and review model         | M4                 |
| `@typseo/next`   | Next.js metadata and schema helpers                 | M3                 |
| `@typseo/ahrefs` | Optional Ahrefs BYOK adapter                        | M5                 |
| `@typseo/gsc`    | Optional Search Console adapter                     | M5                 |

Dependency direction: `core` has no React, Tiptap, Next.js, provider SDK, or integration dependency. React and UI may depend on core; Next.js, AI, Ahrefs, and GSC remain optional. Server-only credentials must never enter a client import graph. Cross-package imports must use declared package dependencies and public exports, not relative paths into another package's source.

The Next.js playground under `apps/playground` is a development host. It is not an SDK package and does not define production component behavior. Documentation site and examples are scheduled for M6.

The M1 engine analyzes a plain, editor-independent document snapshot synchronously. Future editor adapters must schedule or debounce analysis outside the keystroke hot path. Lazy loading, editor render isolation, SSR safety, and bundle budgets must be measured when the corresponding feature exists; M1 makes no bundle-performance claim.
