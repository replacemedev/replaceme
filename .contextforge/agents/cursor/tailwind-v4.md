---
description: Tailwind CSS v4 design system — CSS-first @theme configuration, OKLCH tokens, CVA variants, native animations, and v3 migration patterns.
alwaysApply: true
---

## Tailwind Design System (v4)

> Targets Tailwind CSS v4 only. Verify `tailwindVersion` from project context.

**CRITICAL — CSS Configuration:** No `tailwind.config.ts` — use `@theme {}` in CSS. Replace `@tailwind` directives with `@import "tailwindcss"`. All colors in OKLCH. Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`. Override dark tokens in `.dark {}`, not with `dark:` utility classes in components. Base styles in `@layer base`.

**HIGH — Design Tokens:** Brand → Semantic → Component hierarchy. Names by purpose (`--color-primary`, `--color-destructive`). Radius tokens (`--radius-sm/md/lg/xl`). Alpha variants via `color-mix(in oklch, ...)`.

**HIGH — Components:** CVA for multi-variant components. React 19 — `ref` is a plain prop, no `forwardRef`. `cn()` (clsx + tailwind-merge) for all class merging. Form inputs: `aria-invalid`, `aria-describedby`, `role="alert"` on error. Shared `focusRing` utility.

**MEDIUM — Layout:** Mobile-first grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`). Container queries for component responsiveness. `size-*` for equal dimensions. `gap-*` not `space-*`.

**MEDIUM — Animations:** `@keyframes` inside `@theme`, referenced by `--animate-*` tokens. `@starting-style` for overlay entry transitions with `allow-discrete`. No `tailwindcss-animate`.

### Quick Reference

| v3 | v4 |
|----|----|
| `tailwind.config.ts` | `@theme {}` in CSS |
| `@tailwind base/...` | `@import "tailwindcss"` |
| `darkMode: "class"` | `@custom-variant dark (...)` |
| `theme.extend.colors` | `@theme { --color-*: oklch(...) }` |
| `tailwindcss-animate` | `@keyframes` in `@theme` + `@starting-style` |
| `forwardRef` | plain `ref` prop (React 19) |
| `space-y-4` | `flex flex-col gap-4` |
| `w-10 h-10` | `size-10` |
