---
description: React and Next.js performance optimization — waterfalls, bundle size, server-side, re-renders, and rendering efficiency rules.
alwaysApply: true
---

## React Performance

Evaluate performance in priority order: Waterfalls → Bundle Size → Server-Side → Client Fetching → Re-renders → Rendering → JS → Advanced.

**CRITICAL — Waterfalls:** Use `Promise.all()` for independent async operations — never sequential awaits. Check cheap sync conditions before awaiting expensive remote values. Start promises early, await late. Use Suspense boundaries to stream independent UI segments in parallel.

**CRITICAL — Bundle size:** Never import from barrel files (`index.ts`) — import directly from source files. Use `next/dynamic` for heavy components not needed on initial render. Load optional feature modules conditionally (`await import(...)`). Defer analytics/monitoring/chat until after hydration via `requestIdleCallback`.

**HIGH — Server-side:** Module-level mutable state in RSC/SSR is shared across all concurrent requests — never use it. Use `React.cache()` for per-request deduplication of identical DB calls. Hoist static `fs.readFile` calls to module level. Pass only the fields Client Components need — every RSC prop is serialized to JSON.

**MEDIUM — Re-renders (most commonly violated):** Never define components inside other components — causes full unmount on every parent render. Hoist default non-primitive props (`[]`, `{}`) to module level constants. Derive state during render, not via `useEffect + setState`. Use functional setState (`prev => prev + 1`). Use primitive values (not objects) as effect dependencies.

**MEDIUM — Rendering:** `&&` with non-boolean left side renders `0` — use ternary. Use `useTransition` / `startTransition` for non-urgent updates (search, filters). Never animate SVG elements directly — wrap in a div and animate that.

### Key Rules Quick Reference

| Rule | Pattern |
|------|---------|
| `async-parallel` | `Promise.all([fetchA(), fetchB()])` not sequential awaits |
| `async-cheap-condition-before-await` | Check sync conditions before expensive awaits |
| `bundle-barrel-imports` | `import from '@/utils/format-date'` not `'@/utils'` |
| `bundle-dynamic-imports` | `next/dynamic` for heavy components |
| `bundle-defer-third-party` | `requestIdleCallback(() => analytics.init())` |
| `server-no-shared-module-state` | No `let requestData = {}` at module level in RSC |
| `server-cache-react` | `React.cache(async (id) => db.find(id))` |
| `rerender-no-inline-components` | Define components at module level, not inside parents |
| `rerender-memo-with-default-value` | `const DEFAULT_ITEMS = []` outside component |
| `rerender-derived-state-no-effect` | `const doubled = count * 2` not `useEffect + setState` |
| `rerender-dependencies` | `[user.id, user.role]` not `[user]` in effects |
