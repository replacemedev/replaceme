---
description: UI/UX Design — 10-priority rule framework for accessibility, touch, performance, style, layout, animation, forms, navigation, and charts
globs: ["src/**/*.tsx", "src/**/*.jsx", "src/**/*.vue", "src/**/*.svelte", "**/*.css", "**/*.scss"]
alwaysApply: false
---

# UI/UX Design

## Priority Order (check CRITICAL first)

1. **Accessibility** — CRITICAL: contrast 4.5:1, visible focus rings, alt text, ARIA labels, keyboard nav
2. **Touch & Interaction** — CRITICAL: targets ≥44×44pt, 8px spacing, press feedback within 100ms
3. **Performance** — HIGH: WebP/AVIF images, CLS < 0.1, lazy load, virtualize lists > 50 items
4. **Style** — HIGH: match to product type, no emoji icons, one icon set, one primary CTA
5. **Layout** — HIGH: mobile-first, no horizontal scroll, 4pt/8dp spacing, safe area offsets
6. **Typography & Color** — MEDIUM: 16px min body, semantic color tokens (no raw hex), tabular numbers
7. **Animation** — MEDIUM: 150–300ms, transform/opacity only, interruptible, reduced-motion respected
8. **Forms** — MEDIUM: visible labels, errors below field with fix path, validate on blur
9. **Navigation** — HIGH: ≤5 bottom nav items, predictable back, state preservation
10. **Charts** — LOW: legend visible, tooltips on interact, accessible color + pattern

## Non-Negotiables

- WCAG 4.5:1 contrast for body text; 3:1 for large text and UI components
- Touch targets ≥44×44pt (iOS) / ≥48×48dp (Android)
- Never remove focus rings
- Never use emoji as UI icons — SVG icon sets only
- Never animate `width`, `height`, `top`, `left` — transform/opacity only
- Never placeholder-only form labels
- No auth tokens in `localStorage`
- `font-display: swap` on all web fonts
- `prefers-reduced-motion` must be respected, always

## Pre-Delivery Checklist

- [ ] Contrast passes in light AND dark mode
- [ ] All touch targets meet minimum size
- [ ] Images have explicit width/height (no CLS)
- [ ] Lists > 50 items virtualized
- [ ] Animations interruptible, ≤400ms, respect reduced-motion
- [ ] All inputs have visible labels
- [ ] Safe areas respected (notch, gesture bar, status bar)
- [ ] Tested at 375px mobile, tablet, and landscape
