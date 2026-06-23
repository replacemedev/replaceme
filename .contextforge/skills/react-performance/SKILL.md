# React Performance

## Overview

64 prioritized performance rules for React and Next.js applications across 8 categories. Rules are ordered by impact — fix CRITICAL issues before addressing MEDIUM or LOW ones.

**When to apply:** writing new components, implementing data fetching, reviewing code, refactoring, or running a performance audit.

---

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

---

## 1. Eliminating Waterfalls (CRITICAL)

### `async-parallel`
Use `Promise.all()` for independent operations instead of sequential awaits. Each sequential await adds full round-trip latency.

```ts
// Bad — 200ms + 200ms = 400ms total
const user = await getUser(id)
const posts = await getPosts(id)

// Good — 200ms total (both in parallel)
const [user, posts] = await Promise.all([getUser(id), getPosts(id)])
```

### `async-api-routes`
Start all independent promises before awaiting any of them. Kick off work as early as possible.

```ts
// Bad — sequential: B can't start until A finishes
async function handler() {
  const a = await fetchA()
  const b = await fetchB()
}

// Good — both start immediately
async function handler() {
  const promiseA = fetchA()  // started
  const promiseB = fetchB()  // started
  const [a, b] = await Promise.all([promiseA, promiseB])
}
```

### `async-cheap-condition-before-await`
Check cheap synchronous conditions before awaiting expensive remote values. If you bail out, the await never happens.

```ts
// Bad — always fetches the flag even when user can't use it
async function getFeature(user: User) {
  const flag = await getFeatureFlag('beta')
  if (!user.isBeta) return null
}

// Good — skip the network call entirely
async function getFeature(user: User) {
  if (!user.isBeta) return null
  const flag = await getFeatureFlag('beta')
}
```

### `async-defer-await`
Move `await` into branches where the value is actually used. Don't await unconditionally at the top of a function.

```ts
// Bad — config always awaited even in the fast path
async function process(mode: string) {
  const config = await loadConfig()
  if (mode === 'fast') return fastProcess()
  return fullProcess(config)
}

// Good — config only awaited when needed
async function process(mode: string) {
  if (mode === 'fast') return fastProcess()
  const config = await loadConfig()
  return fullProcess(config)
}
```

### `async-dependencies`
When operations have partial dependencies (B depends on A, C is independent), structure accordingly.

```ts
// Bad — C waits for A unnecessarily
const a = await fetchA()
const b = await fetchB(a.id)
const c = await fetchC()

// Good — C runs in parallel with A, B waits only for A
const [a, c] = await Promise.all([fetchA(), fetchC()])
const b = await fetchB(a.id)
```

### `async-suspense-boundaries`
Use Suspense to stream independent content without blocking on all data. Each boundary resolves independently.

```tsx
// Bad — page waits for slowest piece before showing anything
async function Page() {
  const [header, feed, sidebar] = await Promise.all([...])
  return <Layout header={header} feed={feed} sidebar={sidebar} />
}

// Good — each section streams as its data arrives
function Page() {
  return (
    <Layout>
      <Suspense fallback={<HeaderSkeleton />}><Header /></Suspense>
      <Suspense fallback={<FeedSkeleton />}><Feed /></Suspense>
      <Suspense fallback={<SidebarSkeleton />}><Sidebar /></Suspense>
    </Layout>
  )
}
```

---

## 2. Bundle Size Optimization (CRITICAL)

### `bundle-barrel-imports`
Import directly from the source file, not from barrel `index.ts` files. Barrel imports pull the entire module into the bundle even if tree-shaking is enabled, because bundlers often can't statically analyze barrel re-exports.

```ts
// Bad — may import the entire utils module
import { formatDate } from '@/utils'

// Good — only this one file is included
import { formatDate } from '@/utils/format-date'
```

### `bundle-analyzable-paths`
Use statically analyzable import paths. Dynamic strings in imports prevent tree-shaking and produce over-broad bundle traces.

```ts
// Bad — bundler can't know which locale at build time
const locale = await import(`./locales/${lang}`)

// Good — known at build time
const localeMap = {
  en: () => import('./locales/en'),
  fr: () => import('./locales/fr'),
}
const locale = await localeMap[lang]()
```

### `bundle-dynamic-imports`
Use `next/dynamic` for heavy components that aren't needed on initial load. Keeps the initial bundle small.

```tsx
import dynamic from 'next/dynamic'

const RichEditor = dynamic(() => import('@/components/rich-editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false  // only when module requires browser APIs at module level
})

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), {
  loading: () => <div>Loading viewer...</div>
})
```

### `bundle-defer-third-party`
Load analytics, error monitoring, and chat widgets after hydration. They have zero impact on UX if they load a few seconds later.

```ts
useEffect(() => {
  requestIdleCallback(() => {
    import('@/lib/analytics').then(({ init }) => init())
    import('@/lib/monitoring').then(({ setup }) => setup())
  })
}, [])
```

### `bundle-conditional`
Only load optional feature modules when the feature is activated, not on every page load.

```ts
// Bad — heavy module always in bundle
import { advancedExport } from './advanced-export'

// Good — loaded only when user triggers the feature
async function handleExport() {
  const { advancedExport } = await import('./advanced-export')
  await advancedExport(data)
}
```

### `bundle-preload`
Preload resources on hover or focus to hide latency without adding to initial bundle.

```tsx
<Link
  href="/dashboard"
  onMouseEnter={() => router.prefetch('/dashboard')}
  onFocus={() => router.prefetch('/dashboard')}
>
  Go to Dashboard
</Link>
```

---

## 3. Server-Side Performance (HIGH)

### `server-no-shared-module-state`
Never use module-level mutable variables in RSC or SSR. Module state is shared across all concurrent requests — a major source of request bleed bugs.

```ts
// Bad — requestContext leaks between concurrent requests
let requestContext = {}

export function setContext(data: unknown) {
  requestContext = data  // ← mutates shared state
}

// Good — per-request isolation
export const getRequestContext = React.cache(() => {
  return { data: {} }  // new object per request
})
```

### `server-cache-react`
Use `React.cache()` for per-request deduplication of identical data fetches. Multiple components calling the same function with the same args get one DB query.

```ts
import { cache } from 'react'

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// Component A: getUser('123') → DB query
// Component B: getUser('123') → returns cached result from same request
```

### `server-cache-lru`
Use an LRU cache for expensive computations that can be shared across requests (not personalized data).

```ts
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, Product>({ max: 500, ttl: 1000 * 60 * 5 })

export async function getProduct(id: string) {
  if (cache.has(id)) return cache.get(id)!
  const product = await db.product.findUnique({ where: { id } })
  cache.set(id, product)
  return product
}
```

### `server-hoist-static-io`
Move static file reads to module level. They run once at startup instead of on every request.

```ts
// Bad — reads file on every request
async function getConfig() {
  return JSON.parse(await fs.readFile('./config.json', 'utf8'))
}

// Good — read once at module load
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
export function getConfig() { return config }
```

### `server-serialization`
Pass only the fields a Client Component needs from a Server Component. Every prop is serialized to JSON and included in the RSC payload.

```tsx
// Bad — serializes entire user record including sensitive fields
<UserCard user={fullUser} />

// Good — only the display fields
<UserCard
  name={user.displayName}
  avatarUrl={user.profileImageUrl}
  joinedAt={user.createdAt}
/>
```

### `server-dedup-props`
Avoid passing the same data in multiple props — it gets serialized multiple times.

```tsx
// Bad — post serialized twice
<Article post={post} relatedPosts={[post, ...others]} />

// Good — deduplicated
<Article post={post} relatedPosts={others} />
```

### `server-auth-actions`
Authenticate Server Actions the same way you authenticate API routes. The action is a network request — never trust the caller.

```ts
'use server'

export async function updatePost(id: string, data: PostData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const post = await db.post.findUnique({ where: { id } })
  if (!post || post.authorId !== session.userId) throw new Error('Forbidden')
  
  return db.post.update({ where: { id }, data: validate(data) })
}
```

### `server-parallel-fetching`
Structure component trees to allow parallel data fetching. Data dependencies should be local to the component that uses them.

```tsx
// Bad — sequential: UserProfile waits for Page to fetch, then fetches
async function Page({ id }) {
  const user = await getUser(id)
  return <UserProfile user={user} />
}
async function UserProfile({ user }) {
  const posts = await getPosts(user.id)  // waits for Page
}

// Good — both components fetch in parallel
async function Page({ id }) {
  return (
    <>
      <Suspense><UserProfile id={id} /></Suspense>
      <Suspense><UserPosts id={id} /></Suspense>
    </>
  )
}
async function UserProfile({ id }) { const user = await getUser(id) ... }
async function UserPosts({ id }) { const posts = await getPosts(id) ... }
```

### `server-parallel-nested-fetching`
When fetching data for a list, use `Promise.all` to fetch all items in parallel.

```ts
// Bad — O(n) sequential requests
const results = []
for (const id of ids) {
  results.push(await fetchItem(id))
}

// Good — all in parallel
const results = await Promise.all(ids.map(id => fetchItem(id)))
```

### `server-after-nonblocking`
Use `after()` (Next.js 15+) for side effects that don't need to block the response, like logging or analytics.

```ts
import { after } from 'next/server'

export async function GET(request: Request) {
  const data = await getData()
  after(() => logRequest(request))  // runs after response is sent
  return Response.json(data)
}
```

---

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

### `client-swr-dedup`
Use SWR or React Query for client-side data fetching. They automatically deduplicate identical requests from multiple components, handle background revalidation, and manage loading/error states.

```tsx
// Bad — multiple components each fire their own fetch
function ComponentA() {
  const [user, setUser] = useState(null)
  useEffect(() => { fetch('/api/user').then(...) }, [])
}
function ComponentB() {
  const [user, setUser] = useState(null)
  useEffect(() => { fetch('/api/user').then(...) }, [])  // duplicate request
}

// Good — SWR deduplicates automatically
function ComponentA() { const { data: user } = useSWR('/api/user', fetcher) }
function ComponentB() { const { data: user } = useSWR('/api/user', fetcher) }
// one request for both components
```

### `client-event-listeners`
Deduplicate global event listeners. Adding listeners in multiple component instances without cleanup causes leaks and duplicate handler calls.

```ts
// Bad — adds a new listener on every render
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // missing cleanup → leak
}, [])

// Good — cleanup on unmount
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [handleResize])
```

### `client-passive-event-listeners`
Use `{ passive: true }` for scroll and touch event listeners. Non-passive listeners block the browser's scroll thread.

```ts
useEffect(() => {
  const el = containerRef.current
  el.addEventListener('scroll', handleScroll, { passive: true })
  return () => el.removeEventListener('scroll', handleScroll)
}, [])
```

### `client-localstorage-schema`
Version localStorage schemas and minimize stored data. Unversioned schemas break silently when the shape changes.

```ts
const STORAGE_KEY = 'app-prefs-v2'  // bump version on breaking schema change

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPrefs
    return prefsSchema.parse(JSON.parse(raw))  // validate shape
  } catch {
    localStorage.removeItem(STORAGE_KEY)       // clear corrupt data
    return defaultPrefs
  }
}
```

---

## 5. Re-render Optimization (MEDIUM)

### `rerender-no-inline-components`
Never define components inside other components. Each render creates a new component identity, causing the child to fully unmount and remount.

```tsx
// Bad — Child is a new function every render = unmount/remount
function Parent({ items }: { items: string[] }) {
  const Item = ({ text }: { text: string }) => <li>{text}</li>
  return <ul>{items.map(t => <Item key={t} text={t} />)}</ul>
}

// Good — stable identity
function Item({ text }: { text: string }) { return <li>{text}</li> }
function Parent({ items }: { items: string[] }) {
  return <ul>{items.map(t => <Item key={t} text={t} />)}</ul>
}
```

### `rerender-memo-with-default-value`
Hoist default non-primitive prop values (arrays, objects, functions) to module level. Default values defined inline create new references on every render.

```tsx
// Bad — new array reference on every Parent render triggers re-render of Child
function ProductList({ filters = [] }: { filters?: Filter[] }) {
  return <FilteredList filters={filters} />
}

// Good
const DEFAULT_FILTERS: Filter[] = []
function ProductList({ filters = DEFAULT_FILTERS }: { filters?: Filter[] }) {
  return <FilteredList filters={filters} />
}
```

### `rerender-memo`
Extract expensive pure computations into memoized child components using `React.memo`.

```tsx
// Bad — expensive computation runs on every parent re-render
function Dashboard({ data, theme }: Props) {
  const chart = <HeavyChart data={data} />  // re-renders when theme changes
  return <div style={{ color: theme }}>{chart}</div>
}

// Good — chart only re-renders when data changes
const HeavyChart = React.memo(({ data }: { data: ChartData }) => {
  // expensive rendering
})
```

### `rerender-derived-state-no-effect`
Derive state values during render, not via `useEffect + setState`. Effects add an extra render cycle.

```tsx
// Bad — two renders: one from count change, one from effect
const [count, setCount] = useState(0)
const [isEven, setIsEven] = useState(true)
useEffect(() => { setIsEven(count % 2 === 0) }, [count])

// Good — derived synchronously, one render
const [count, setCount] = useState(0)
const isEven = count % 2 === 0
```

### `rerender-defer-reads`
Don't subscribe to state values that are only read in callbacks — use refs instead to avoid unnecessary re-renders.

```tsx
// Bad — re-renders on every scroll position change
const [scrollY, setScrollY] = useState(0)
const handleClick = () => console.log(scrollY)  // only used in callback

// Good — ref doesn't trigger re-renders
const scrollYRef = useRef(0)
useEffect(() => {
  const update = () => { scrollYRef.current = window.scrollY }
  window.addEventListener('scroll', update, { passive: true })
  return () => window.removeEventListener('scroll', update)
}, [])
const handleClick = () => console.log(scrollYRef.current)
```

### `rerender-dependencies`
Use primitive values as effect dependencies, not object references. Object references change on every render even with identical content.

```tsx
// Bad — user object is a new reference on every render → infinite loop
useEffect(() => { syncProfile(user) }, [user])

// Good — stable primitive dependencies
useEffect(() => { syncProfile({ id: user.id, role: user.role }) }, [user.id, user.role])
```

### `rerender-derived-state`
Subscribe to derived booleans, not raw state values. Derived booleans are stable across renders where the raw value changes but the derived result doesn't.

```tsx
// Bad — re-renders whenever requestCount changes even if loading state is same
const [requestCount, setRequestCount] = useState(0)
// Consumer re-renders on every increment

// Good
const isLoading = requestCount > 0  // only changes from false→true and back
```

### `rerender-functional-setstate`
Use functional setState when the new value depends on the previous state. Avoids stale closure bugs in async contexts.

```tsx
// Bad — stale closure: count captured at time of click
function increment() { setCount(count + 1) }

// Good — always uses the latest state
function increment() { setCount(prev => prev + 1) }
```

### `rerender-lazy-state-init`
Pass a function to `useState` for expensive initial computations. The function is called only on the first render.

```tsx
// Bad — computeInitialState() called on every render
const [state, setState] = useState(computeInitialState(props))

// Good — called only once
const [state, setState] = useState(() => computeInitialState(props))
```

### `rerender-simple-expression-in-memo`
Don't wrap trivial primitive expressions in `useMemo`. The memoization overhead exceeds the computation cost.

```tsx
// Bad — memo overhead for a simple arithmetic
const total = useMemo(() => price * quantity, [price, quantity])

// Good — just compute it
const total = price * quantity
```

### `rerender-split-combined-hooks`
Split hooks that combine independent state concerns. Combined state forces re-renders when only one piece changes.

```tsx
// Bad — any filter change re-renders everything consuming this hook
function usePageState() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('asc')
  const [page, setPage] = useState(1)
  return { query, setQuery, sort, setSort, page, setPage }
}

// Good — separate hooks, independent subscriptions
function useSearch() { return useState('') }
function useSort() { return useState<'asc' | 'desc'>('asc') }
function usePage() { return useState(1) }
```

### `rerender-move-effect-to-event`
Put interaction logic in event handlers, not effects. Effects that react to user interactions are harder to reason about and cause extra renders.

```tsx
// Bad — effect watches state set by an event
function handleSubmit() { setSubmitted(true) }
useEffect(() => {
  if (submitted) { sendAnalytics(); setSubmitted(false) }
}, [submitted])

// Good — logic in the event handler
function handleSubmit() {
  sendAnalytics()
  submitForm()
}
```

### `rerender-transitions`
Use `startTransition` to mark non-urgent state updates. React can interrupt them to keep the UI responsive.

```tsx
import { startTransition, useTransition } from 'react'

function SearchBar() {
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value)                              // urgent: update input immediately
    startTransition(() => setSearchQuery(e.target.value)) // non-urgent: filter results
  }
  return <input value={input} onChange={handleChange} />
}
```

### `rerender-use-deferred-value`
Use `useDeferredValue` to keep inputs responsive while expensive renders catch up.

```tsx
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query)
  // deferredQuery lags behind query — keeps input fast, results catch up
  return <ExpensiveList filter={deferredQuery} />
}
```

### `rerender-use-ref-transient-values`
Use refs for values that change frequently but don't need to trigger a render (mouse position, scroll offset, animation frames).

```tsx
const mousePositionRef = useRef({ x: 0, y: 0 })

useEffect(() => {
  const track = (e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY }
  }
  document.addEventListener('mousemove', track, { passive: true })
  return () => document.removeEventListener('mousemove', track)
}, [])
```

---

## 6. Rendering Performance (MEDIUM)

### `rendering-conditional-render`
Use ternary operators for conditional rendering, not `&&` with non-boolean left side. `0 && <Component />` renders `0`.

```tsx
// Bad — renders "0" when count is 0
{count && <Badge count={count} />}

// Good — renders nothing when count is 0
{count > 0 && <Badge count={count} />}
{count ? <Badge count={count} /> : null}
```

### `rendering-hoist-jsx`
Extract static JSX outside the component. Inline static JSX creates new object references on every render.

```tsx
// Bad — new JSX object on every render
function Page() {
  const header = <h1 className="text-2xl font-bold">Dashboard</h1>
  return <div>{header}<Content /></div>
}

// Good — created once
const HEADER = <h1 className="text-2xl font-bold">Dashboard</h1>
function Page() { return <div>{HEADER}<Content /></div> }
```

### `rendering-animate-svg-wrapper`
Animate a wrapping `div`, not the SVG element itself. CSS transforms on SVG don't always get GPU compositing.

```tsx
// Bad — SVG transforms are not always composited
<svg style={{ transform: `rotate(${angle}deg)` }}>...</svg>

// Good — div gets GPU layer
<div style={{ transform: `rotate(${angle}deg)` }}>
  <svg>...</svg>
</div>
```

### `rendering-content-visibility`
Use `content-visibility: auto` for below-fold content sections to skip paint and layout for off-screen content.

```css
.below-fold-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* estimated height prevents layout shift */
}
```

### `rendering-hydration-suppress-warning`
Suppress expected hydration mismatches (browser extension injections, formatted dates) with `suppressHydrationWarning`.

```tsx
<time
  suppressHydrationWarning
  dateTime={isoDate}
>
  {formattedDate}
</time>
```

### `rendering-hydration-no-flicker`
Use an inline script to read client-only values (theme from localStorage) before first paint.

```html
<!-- In <head> — runs synchronously before hydration -->
<script
  dangerouslySetInnerHTML={{
    __html: `document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light'`
  }}
/>
```

### `rendering-activity`
Use the React `<Activity>` component to hide/show content without unmounting (preserves DOM state and avoids refetch).

```tsx
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <ExpensivePanel />
</Activity>
```

### `rendering-usetransition-loading`
Use `useTransition` for loading states during navigation or heavy operations. Keeps current UI visible until the transition is ready.

```tsx
const [isPending, startTransition] = useTransition()

function navigateTo(path: string) {
  startTransition(() => router.push(path))
}

return (
  <button onClick={() => navigateTo('/report')} disabled={isPending}>
    {isPending ? 'Loading...' : 'View Report'}
  </button>
)
```

### `rendering-resource-hints`
Use React DOM resource hints to preload critical assets.

```tsx
import { prefetchDNS, preconnect, preload } from 'react-dom'

function App() {
  prefetchDNS('https://fonts.googleapis.com')
  preconnect('https://api.example.com')
  preload('/fonts/inter.woff2', { as: 'font', crossOrigin: 'anonymous' })
  return <main>...</main>
}
```

### `rendering-script-defer-async`
Use `defer` or `async` on script tags in `next/head` or layouts to prevent render blocking.

```tsx
<Script src="https://cdn.example.com/widget.js" strategy="lazyOnload" />
```

---

## 7. JavaScript Performance (LOW-MEDIUM)

### `js-set-map-lookups`
Use `Set` or `Map` for O(1) lookups instead of `.includes()` or `.find()` on arrays, especially in loops.

```ts
// Bad — O(n) lookup on every iteration
const isAllowed = (id: string) => allowedIds.includes(id)  // O(n) each call

// Good — O(1) lookup
const allowedSet = new Set(allowedIds)
const isAllowed = (id: string) => allowedSet.has(id)  // O(1)
```

### `js-index-maps`
Build a lookup Map once for repeated object lookups by key instead of finding in arrays each time.

```ts
// Bad — O(n) per lookup
const getProduct = (id: string) => products.find(p => p.id === id)

// Good — build index once
const productMap = new Map(products.map(p => [p.id, p]))
const getProduct = (id: string) => productMap.get(id)  // O(1)
```

### `js-combine-iterations`
Combine multiple `.filter()`, `.map()`, `.reduce()` into a single loop. Each chained method iterates the full array.

```ts
// Bad — 3 full passes
const result = items
  .filter(i => i.active)
  .map(i => i.value)
  .reduce((sum, v) => sum + v, 0)

// Good — 1 pass
const result = items.reduce((sum, i) => i.active ? sum + i.value : sum, 0)
```

### `js-flatmap-filter`
Use `flatMap` to map and conditionally include items in a single pass.

```ts
// Bad — two passes
const results = items.map(transform).filter(Boolean)

// Good — one pass
const results = items.flatMap(i => {
  const result = transform(i)
  return result ? [result] : []
})
```

### `js-early-exit`
Return early from functions to avoid unnecessary work in the common case.

```ts
// Bad — processes everything then conditionally returns
function processItem(item: Item) {
  const result = expensiveProcess(item)
  if (!item.enabled) return null
  return result
}

// Good — skip expensive work when not needed
function processItem(item: Item) {
  if (!item.enabled) return null
  return expensiveProcess(item)
}
```

### `js-hoist-regexp`
Hoist `RegExp` creation outside loops. Constructing a regex inside a loop recreates the compiled pattern each iteration.

```ts
// Bad — new RegExp on each iteration
for (const item of items) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) { ... }
}

// Good — compiled once
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
for (const item of items) {
  if (DATE_PATTERN.test(item.date)) { ... }
}
```

### `js-cache-function-results`
Cache expensive pure function results at module level using a Map.

```ts
// Bad — recomputes for same input
function parseSchema(raw: string) {
  return expensiveParse(raw)  // runs every time
}

// Good — memoized
const parseCache = new Map<string, Schema>()
function parseSchema(raw: string) {
  if (parseCache.has(raw)) return parseCache.get(raw)!
  const result = expensiveParse(raw)
  parseCache.set(raw, result)
  return result
}
```

### `js-cache-storage`
Cache `localStorage`/`sessionStorage` reads in memory. Storage access triggers synchronous I/O.

```ts
let cachedPrefs: Prefs | null = null

function getPrefs(): Prefs {
  if (cachedPrefs) return cachedPrefs
  const raw = localStorage.getItem('prefs')
  cachedPrefs = raw ? JSON.parse(raw) : defaultPrefs
  return cachedPrefs
}

function savePrefs(prefs: Prefs) {
  cachedPrefs = prefs
  localStorage.setItem('prefs', JSON.stringify(prefs))
}
```

### `js-min-max-loop`
Use a single-pass loop for min/max instead of `sort()`. Sort is O(n log n); a loop is O(n).

```ts
// Bad — O(n log n)
const max = Math.max(...values.sort())

// Good — O(n)
const max = values.reduce((m, v) => v > m ? v : m, -Infinity)
// or: let max = -Infinity; for (const v of values) if (v > max) max = v
```

### `js-length-check-first`
Check array length before expensive comparison operations. Short-circuit before doing unnecessary work.

```ts
// Bad — always computes the expensive comparison
const hasMatches = getExpensiveList().some(item => item.id === target)

// Good
const list = getExpensiveList()
const hasMatches = list.length > 0 && list.some(item => item.id === target)
```

### `js-batch-dom-css`
Batch CSS changes via class names or `cssText`. Individual `style.property` assignments each trigger style recalculation.

```ts
// Bad — 3 style recalculations
el.style.width = '200px'
el.style.height = '100px'
el.style.opacity = '0.5'

// Good — 1 recalculation
el.style.cssText = 'width: 200px; height: 100px; opacity: 0.5;'
// Or better — use class toggle
el.classList.add('panel-collapsed')
```

### `js-tosorted-immutable`
Use `toSorted()`, `toReversed()`, `toSpliced()` for immutable array operations. `sort()` mutates the original.

```ts
// Bad — mutates original array; causes bugs when original is state/prop
const sorted = items.sort((a, b) => a.name.localeCompare(b.name))

// Good — creates new array, original untouched
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name))
```

### `js-request-idle-callback`
Defer non-critical work to browser idle time to avoid blocking user interactions.

```ts
// Bad — runs immediately, may block interaction
parseSearchIndex(documents)

// Good — runs when browser is idle
requestIdleCallback(() => parseSearchIndex(documents), { timeout: 2000 })
```

### `js-cache-property-access`
Cache deeply nested property access in tight loops. Each access traverses the property chain.

```ts
// Bad — obj.config.theme.colors accessed on every iteration
for (const item of items) {
  apply(item, obj.config.theme.colors.primary)
}

// Good
const primaryColor = obj.config.theme.colors.primary
for (const item of items) {
  apply(item, primaryColor)
}
```

---

## 8. Advanced Patterns (LOW)

### `advanced-effect-event-deps`
Don't include `useEffectEvent` results in effect dependency arrays. `useEffectEvent` wraps values in a stable ref — it's intentionally excluded from deps.

```tsx
const onComplete = useEffectEvent((result: Result) => {
  onSuccess(result)  // onSuccess can change without re-running the effect
})

useEffect(() => {
  runOperation(onComplete)
  // onComplete intentionally NOT in deps — it's always current
}, [runOperation])
```

### `advanced-event-handler-refs`
Store event handlers in refs to avoid re-registering event listeners when handler identity changes.

```tsx
const handlerRef = useRef(handler)
useEffect(() => { handlerRef.current = handler })

useEffect(() => {
  const stable = (e: Event) => handlerRef.current(e)
  el.addEventListener('click', stable)
  return () => el.removeEventListener('click', stable)
}, [el])  // no handler in deps
```

### `advanced-init-once`
Initialize app-level singletons (analytics, feature flag clients, DB connections) exactly once per app load.

```ts
// Bad — may initialize multiple times due to StrictMode double-invoke
let client: AnalyticsClient
export function getAnalytics() {
  if (!client) client = new AnalyticsClient()
  return client
}

// Good — module-level singleton, initialized when module is first imported
export const analytics = new AnalyticsClient(process.env.ANALYTICS_KEY)
```

### `advanced-use-latest`
The `useLatest` pattern provides a stable callback ref that always reflects the current value without stale closures.

```tsx
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => { ref.current = value })
  return ref
}

// Usage — callback is always current, but stable reference
const latestOnChange = useLatest(onChange)
useEffect(() => {
  const handle = (e: Event) => latestOnChange.current(e)
  el.addEventListener('input', handle)
  return () => el.removeEventListener('input', handle)
}, [el])
```
