---
description: Next.js App Router best practices — Server Components by default, data fetching, caching, Server Actions, and routing conventions
globs: ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "actions/**/*.ts"]
alwaysApply: true
---

# Next.js Best Practices

## Server vs Client Components

**Default: Server Component.** Add `'use client'` only for:
- `useState`, `useReducer`, `useEffect`, `useRef`
- DOM event handlers (`onClick`, `onChange`)
- Browser-only APIs (`localStorage`, `window`)
- Third-party libs requiring browser context

Push `'use client'` to the deepest leaf node. Never add it to layout or page files unless unavoidable.

## Data Fetching (in Server Components)

| Data type | Strategy |
|---|---|
| Doesn't change | `fetch(url)` — default, build-time cached |
| Changes periodically | `fetch(url, { next: { revalidate: 60 } })` |
| Per-request / personalized | `fetch(url, { cache: 'no-store' })` |
| DB/ORM query | `noStore()` at top of component |

Never `useEffect + fetch` for route data. Use `async/await` in Server Components.

## File Conventions (required on data-fetching routes)

- `loading.tsx` — auto Suspense boundary; never skip
- `error.tsx` — Error Boundary; must be `'use client'`; never skip
- `not-found.tsx` — for `notFound()` calls
- Route groups `(name)` — organize without URL impact

## Server Actions

```ts
'use server'
// 1. Validate with Zod
// 2. Authorize server-side (never trust client IDs)
// 3. Return { success, data } or { success: false, error }
// 4. revalidatePath() or revalidateTag() after mutation
```

## Performance

- `next/image` for all images (not `<img>`)
- `next/link` for all internal links (not `<a href>`)
- `next/font` for fonts
- `next/dynamic` for heavy below-fold Client Components

## Anti-Patterns

- `'use client'` on page/layout = entire subtree goes client
- `useEffect + fetch` = no caching, waterfall, bigger bundle
- `<img>` = no optimization, CLS
- Missing `loading.tsx` = blank page on slow network
- Missing `error.tsx` = crash propagates to root
- `force-dynamic` globally = disables caching everywhere
- Server secrets or DB in Client Components = exposed in bundle
