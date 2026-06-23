# Next.js Best Practices

## Overview

Principles and patterns for Next.js App Router development. The App Router (introduced in Next.js 13, stable in 14+) inverts the default rendering model compared to the Pages Router: every component is a **Server Component** by default, and client-side rendering must be explicitly opted into.

---

## 1. Server vs Client Components

### The Decision Tree

```
Does this component need...?
│
├── useState, useReducer, useContext
│   └── 'use client'
│
├── useEffect (browser side effects, subscriptions)
│   └── 'use client'
│
├── DOM event handlers (onClick, onChange, onSubmit)
│   └── 'use client'
│
├── Browser-only APIs (localStorage, window, navigator, IntersectionObserver)
│   └── 'use client'
│
├── Third-party library that requires browser context
│   └── 'use client' + dynamic import if needed
│
└── Just rendering data, layout, or static content
    └── Server Component (default — no directive needed)
```

**Server Component — default, no directive:**
```tsx
// app/products/page.tsx
async function ProductsPage() {
  const products = await db.product.findMany()
  return (
    <main>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </main>
  )
}
```

**Client Component — explicit opt-in:**
```tsx
'use client'
// components/add-to-cart.tsx
import { useState } from 'react'

export function AddToCart({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false)
  return (
    <button onClick={() => setAdded(true)}>
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}
```

### The Golden Rule: Push 'use client' Deep

Split components so the Server Component renders data and the Client Component handles only interactivity:

```tsx
// app/products/[id]/page.tsx — Server Component
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } })
  if (!product) notFound()

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Only this button is a Client Component */}
      <AddToCart productId={product.id} />
    </div>
  )
}
```

### What Each Type Can/Cannot Do

| Capability | Server Component | Client Component |
|---|---|---|
| `async/await` at component level | Yes | No |
| Access environment variables (server-only) | Yes | No (only `NEXT_PUBLIC_*`) |
| Access databases, file system | Yes | No |
| `useState`, `useEffect`, hooks | No | Yes |
| Event handlers | No | Yes |
| Browser APIs | No | Yes |
| Import server-only libraries | Yes | No |
| Render Client Components | Yes | Yes |
| Render Server Components | Yes | No (they become Client Components) |

### Passing Server Data to Client Components

```tsx
// Server Component fetches, Client Component receives as props
async function Page() {
  const user = await getUser() // server-only fetch
  return <UserSettings initialData={user} /> // Client Component
}
```

Avoid passing complex objects. Serialize to plain types before passing to Client Components.

---

## 2. Data Fetching Patterns

### Fetch Strategy Selection

| Data type | Strategy | Code |
|---|---|---|
| Build-time static (docs, marketing) | Static | `fetch(url)` |
| Periodically refreshed (product catalog) | ISR | `fetch(url, { next: { revalidate: 60 } })` |
| Per-request personalized (dashboard, auth) | Dynamic | `fetch(url, { cache: 'no-store' })` |
| ORM/DB query | Dynamic | Use `import { unstable_noStore as noStore } from 'next/cache'; noStore()` |

### Static Fetching (default)
```tsx
async function BlogPage() {
  // Cached at build time, served from CDN
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return <PostList posts={posts} />
}
```

### ISR — Time-Based Revalidation
```tsx
async function ProductsPage() {
  // Fresh data every 60 seconds; stale data served from cache in between
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }
  }).then(r => r.json())
  return <ProductGrid products={products} />
}
```

### Dynamic — Per Request
```tsx
async function DashboardPage() {
  // Never cached; fetched fresh on every request
  const data = await fetch('https://api.example.com/user/stats', {
    cache: 'no-store'
  }).then(r => r.json())
  return <StatsPanel data={data} />
}
```

### Database/ORM Queries
```tsx
import { unstable_noStore as noStore } from 'next/cache'

async function OrdersPage() {
  noStore() // marks this route as dynamic
  const orders = await db.order.findMany({ where: { userId: await getUserId() } })
  return <OrderTable orders={orders} />
}
```

### Parallel vs Sequential Fetching

**Sequential (avoid in hot paths):**
```tsx
const user = await getUser(id)        // waits
const orders = await getOrders(id)    // then waits again
```

**Parallel (preferred):**
```tsx
const [user, orders] = await Promise.all([
  getUser(id),
  getOrders(id)
])
```

---

## 3. Caching Architecture

Three independent cache layers:

### Layer 1: Request Memoization
- Scope: single render pass
- Automatic — `fetch()` calls with the same URL + options are deduplicated
- Means you can safely call the same data function in multiple components without N+1 fetches

### Layer 2: Data Cache
- Scope: persists across requests and deployments
- Controlled by `fetch` options (`revalidate`, `no-store`, tags)
- Purge with `revalidatePath(path)` or `revalidateTag(tag)`

Tag-based invalidation:
```tsx
// Tag the fetch
const posts = await fetch('/api/posts', {
  next: { tags: ['posts'] }
})

// In a Server Action, after mutation:
revalidateTag('posts')        // purges all fetches tagged 'posts'
revalidatePath('/blog')       // purges the entire /blog route
```

### Layer 3: Full Route Cache
- Scope: built at deploy time for static routes
- Dynamic routes (using `cookies()`, `headers()`, `searchParams`) automatically bypass this
- `export const dynamic = 'force-dynamic'` forces bypass — use only when necessary

### Route Segment Config Options
```tsx
// At the top of page.tsx or layout.tsx
export const dynamic = 'force-dynamic'     // never cache this route
export const revalidate = 3600             // ISR: revalidate every hour
export const revalidate = false            // never revalidate (permanent cache)
export const fetchCache = 'force-no-store' // force all fetches uncached
```

---

## 4. Routing and File Conventions

### Required Files

| File | Purpose | Notes |
|---|---|---|
| `page.tsx` | Route UI | Required for route to be accessible |
| `layout.tsx` | Shared wrapping UI | Persists state across child navigation |
| `loading.tsx` | Streaming skeleton | Automatic Suspense boundary |
| `error.tsx` | Error boundary | **Must be `'use client'`** |
| `not-found.tsx` | 404 handler | Triggered by `notFound()` |
| `route.ts` | API endpoint | Exports `GET`, `POST`, etc. |

**Never skip `loading.tsx` and `error.tsx` on data-fetching routes.** Missing `loading.tsx` means users see a blank page during streaming. Missing `error.tsx` means an uncaught fetch error crashes the entire page tree.

### Route Organization Patterns

```
app/
├── (marketing)/           # Route group — no URL impact
│   ├── page.tsx           # → /
│   └── about/
│       └── page.tsx       # → /about
├── (dashboard)/
│   ├── layout.tsx         # Dashboard shell (sidebar, nav)
│   ├── page.tsx           # → /dashboard (if no conflict)
│   └── settings/
│       └── page.tsx       # → /settings
├── blog/
│   ├── page.tsx           # → /blog
│   └── [slug]/
│       ├── page.tsx       # → /blog/[slug]
│       ├── loading.tsx    # ← required
│       └── error.tsx      # ← required
└── api/
    └── posts/
        └── route.ts       # → /api/posts
```

### Dynamic Routes
```
app/products/[id]/page.tsx           → /products/123
app/blog/[...slug]/page.tsx          → /blog/a/b/c
app/[[...slug]]/page.tsx             → / and /a/b/c
```

### `notFound()` and `redirect()`
```tsx
import { notFound, redirect } from 'next/navigation'

async function Page({ params }: { params: { id: string } }) {
  const item = await db.item.findUnique({ where: { id: params.id } })
  if (!item) notFound()                     // renders not-found.tsx
  if (!item.published) redirect('/drafts')  // 307 redirect
  return <ItemView item={item} />
}
```

---

## 5. Server Actions

Server Actions run server-side code in response to form submissions or button clicks without a separate API route.

### Basic Form Action
```tsx
// actions/create-post.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

export async function createPost(formData: FormData) {
  const result = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!result.success) {
    return { success: false, error: result.error.flatten() }
  }

  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  await db.post.create({
    data: { ...result.data, authorId: session.userId }
  })

  revalidatePath('/blog')
  return { success: true }
}
```

```tsx
// components/create-post-form.tsx
'use client'
import { useFormState } from 'react-dom'
import { createPost } from '@/actions/create-post'

export function CreatePostForm() {
  const [state, action] = useFormState(createPost, null)
  return (
    <form action={action}>
      <input name="title" />
      <textarea name="content" />
      {state?.error && <p>{JSON.stringify(state.error)}</p>}
      <button type="submit">Create</button>
    </form>
  )
}
```

### Rules for Server Actions
1. Mark with `'use server'` — in the function or at the top of the file
2. Validate all inputs — never trust form data
3. Authorize server-side — fetch the session inside the action
4. Return typed responses — `{ success: boolean, data?, error? }`
5. Revalidate after writes — `revalidatePath` or `revalidateTag`
6. Never trust client-passed IDs for ownership — verify against the authenticated user

---

## 6. Route Handlers (API Routes)

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')

  const posts = await db.post.findMany({
    skip: (page - 1) * 10,
    take: 10,
  })

  return NextResponse.json({ posts })
}

const createSchema = z.object({ title: z.string().min(1) })

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const post = await db.post.create({ data: result.data })
  return NextResponse.json({ post }, { status: 201 })
}
```

### Route Handler Rules
- Validate input with Zod
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Handle all error cases explicitly
- Prefer Server Actions over Route Handlers for mutations triggered from your own UI

---

## 7. Metadata

### Static Metadata
```tsx
// app/blog/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles',
  openGraph: {
    title: 'Blog',
    description: 'Latest articles',
    images: ['/og/blog.png'],
  },
}
```

### Dynamic Metadata
```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.ogImage ?? '/og/default.png'],
    },
    alternates: { canonical: `/blog/${params.slug}` },
  }
}
```

### Metadata Checklist
- `title` — 50–60 characters
- `description` — 150–160 characters
- Open Graph `title`, `description`, `images` (1200×630px)
- `alternates.canonical` on all public pages

---

## 8. Performance

### Images
```tsx
import Image from 'next/image'

// Hero image (above fold)
<Image
  src="/hero.jpg"
  alt="Product hero"
  width={1200}
  height={630}
  priority            // preloads — use only for above-fold LCP image
  placeholder="blur"
  blurDataURL="..."
/>

// Gallery images (below fold)
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  // lazy loaded by default — no need to add
/>
```

### Fonts
```tsx
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Dynamic Imports for Heavy Client Components
```tsx
import dynamic from 'next/dynamic'

// Heavy chart library — only loaded when rendered
const Chart = dynamic(() => import('@/components/chart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />,
  ssr: false, // only when the component requires browser APIs at module level
})
```

---

## 9. Project Structure

```
app/
├── (marketing)/              # Public pages route group
│   ├── page.tsx              # → /
│   ├── about/page.tsx        # → /about
│   └── blog/
│       ├── page.tsx          # → /blog
│       └── [slug]/
│           ├── page.tsx
│           ├── loading.tsx   ← required
│           └── error.tsx     ← required
│
├── (dashboard)/              # Authenticated pages
│   ├── layout.tsx            # Auth guard + shell
│   ├── page.tsx              # → /dashboard
│   └── settings/page.tsx
│
├── api/
│   └── webhooks/
│       └── route.ts
│
components/
├── ui/                       # Design system primitives
├── features/                 # Feature-specific components
└── layouts/                  # Layout components

lib/
├── db.ts                     # Database client (singleton)
├── auth.ts                   # Auth utilities
└── validations.ts            # Shared Zod schemas

actions/                      # Server Actions
hooks/                        # Client hooks
types/                        # Shared TypeScript types
```

---

## 10. Anti-Patterns Reference

| Don't | Do instead | Why |
|---|---|---|
| `'use client'` on page/layout files | Server Component default; `'use client'` on leaf nodes only | Entire subtree becomes client-rendered |
| `useEffect + fetch` for route data | `async/await` in Server Components | Waterfall, no caching, larger bundle |
| `<img>` for images | `next/image` | No optimization, CLS, poor Core Web Vitals |
| `<a href>` for internal links | `next/link` | No prefetching, full page reload |
| Skipping `loading.tsx` | Add `loading.tsx` to every data-fetching segment | Blank page on slow connections |
| Skipping `error.tsx` | Add `error.tsx` to every segment | Crashes propagate to root layout |
| `force-dynamic` everywhere | Use selectively, only when data is per-request | Disables caching; slower, more expensive |
| Secrets in Client Components | Server Components + env vars without `NEXT_PUBLIC_` | Exposed in client bundle |
| Trusting client-provided IDs in mutations | Fetch session server-side; verify ownership | Authorization bypass |
| `fetch` in Server Action without revalidation | `revalidatePath` / `revalidateTag` after mutation | Stale data served after updates |
