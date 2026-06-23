# UI/UX Design

## Overview

Comprehensive design intelligence for web and mobile UI/UX. Contains 99+ guidelines across 10 priority categories, a design system creation framework, pre-delivery checklists, and platform-specific guidance for iOS HIG, Material Design, React Native, and web.

**Decision criteria:** if the task will change how something looks, feels, moves, or is interacted with — apply this skill.

---

## When to Apply

**Must use:**
- Designing new pages (landing page, dashboard, admin, SaaS, mobile app)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color, typography, spacing, or layout systems
- Reviewing UI code for UX quality, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making design system decisions

**Recommended:**
- UI looks "unprofessional" but the reason is unclear
- Receiving usability feedback
- Pre-launch quality optimization
- Building or extending a design system
- Aligning cross-platform design (web / iOS / Android)

**Skip:**
- Pure backend logic with no UI surface
- API-only or database-only work
- Infrastructure or DevOps work
- Non-visual scripts or automation

---

## Priority Rule Framework

Evaluate in priority order. Higher-priority issues must be resolved before lower ones.

| Priority | Category | Level |
|---|---|---|
| 1 | Accessibility | CRITICAL |
| 2 | Touch & Interaction | CRITICAL |
| 3 | Performance | HIGH |
| 4 | Style Selection | HIGH |
| 5 | Layout & Responsive | HIGH |
| 6 | Typography & Color | MEDIUM |
| 7 | Animation | MEDIUM |
| 8 | Forms & Feedback | MEDIUM |
| 9 | Navigation Patterns | HIGH |
| 10 | Charts & Data | LOW |

---

## Priority 1: Accessibility (CRITICAL)

`color-contrast` — Minimum 4.5:1 contrast ratio for normal text; 3:1 for large text (18pt+ or 14pt+ bold) and UI components (Material Design, WCAG AA).

`focus-states` — Visible focus rings on all interactive elements (2–4px ring). Never remove focus outlines. (Apple HIG, Material Design)

`alt-text` — Descriptive alt text for meaningful images; `alt=""` for decorative images so screen readers skip them.

`aria-labels` — `aria-label` for icon-only buttons; `accessibilityLabel` in native apps. Never leave interactive controls unlabeled.

`keyboard-nav` — Tab order matches visual order; all interactive elements fully operable by keyboard alone. (Apple HIG)

`form-labels` — `<label for>` on every input. Placeholder text is not a label.

`skip-links` — "Skip to main content" link for keyboard users; must be the first focusable element.

`heading-hierarchy` — Sequential h1→h6 with no level skips. One h1 per page.

`color-not-only` — Never convey information by color alone. Always pair color with an icon, pattern, or text.

`dynamic-type` — Support system text scaling (iOS Dynamic Type, Android Large Text). No truncation as text grows. (Apple HIG, Material Design)

`reduced-motion` — Respect `prefers-reduced-motion`; reduce or disable all animations when requested. (Apple Reduced Motion API, Material Design)

`voiceover-sr` — Meaningful `accessibilityLabel`/`accessibilityHint`; logical reading order for VoiceOver and TalkBack. (Apple HIG, Material Design)

`escape-routes` — Provide cancel/back in modals and multi-step flows. Users must always have a way out. (Apple HIG)

`keyboard-shortcuts` — Preserve system and accessibility shortcuts; provide keyboard alternatives for drag-and-drop. (Apple HIG)

**Common anti-patterns:** removing focus rings for visual cleanliness; icon-only buttons without labels; gray-on-gray text combinations.

---

## Priority 2: Touch & Interaction (CRITICAL)

`touch-target-size` — Minimum 44×44pt (Apple) / 48×48dp (Material). Extend hit area beyond visual bounds with padding or `hitSlop` if the visual element is smaller.

`touch-spacing` — Minimum 8px/8dp gap between adjacent touch targets. (Apple HIG, Material Design)

`hover-vs-tap` — Primary interactions use click/tap. Hover is enhancement only — never the only path to critical functionality.

`loading-buttons` — Disable buttons during async operations; show spinner or progress indicator.

`error-feedback` — Clear error messages positioned near the problem element.

`cursor-pointer` — `cursor: pointer` on all clickable elements (web).

`tap-delay` — Use `touch-action: manipulation` to eliminate 300ms delay on web.

`standard-gestures` — Use platform-standard gestures consistently. Do not redefine swipe-back, pinch-zoom, or pull-to-refresh. (Apple HIG)

`system-gestures` — Never block Control Center swipe, back swipe, home indicator gestures, or other OS-level gestures. (Apple HIG)

`press-feedback` — Visual feedback on press within 80–150ms (ripple, opacity change, or elevation change). (Material Design state layers)

`haptic-feedback` — Haptics for confirmations and critical actions. Avoid overuse — haptics should feel meaningful, not constant. (Apple HIG)

`gesture-alternative` — Never rely on gesture-only interactions for critical actions. Always provide a visible control as an alternative.

`safe-area-awareness` — Keep primary touch targets away from the notch, Dynamic Island, gesture bar, and screen edges.

`no-precision-required` — Avoid requiring pixel-perfect taps on small icons or thin edges. Design for fat fingers.

`swipe-clarity` — Swipe actions must show clear affordance (chevron, label, reveal animation, or onboarding hint).

`drag-threshold` — Use a minimum movement threshold before starting a drag to prevent accidental activation.

**Common anti-patterns:** relying on hover for primary interaction; instant state changes with 0ms visual feedback; touch targets under 30pt.

---

## Priority 3: Performance (HIGH)

`image-optimization` — Use WebP/AVIF; responsive images with `srcset`/`sizes`; lazy load all non-critical assets.

`image-dimension` — Declare `width` and `height` or use `aspect-ratio` on every image to prevent layout shift. (Core Web Vitals: CLS < 0.1)

`font-loading` — `font-display: swap` or `optional` to prevent invisible text (FOIT). Reserve space to reduce layout shift. (Material Design)

`font-preload` — Preload only the critical font variants; never preload every weight and style.

`critical-css` — Inline or early-load above-the-fold CSS. Defer non-critical styles.

`lazy-loading` — Lazy load non-hero components via dynamic import / route-level splitting.

`bundle-splitting` — Split by route/feature (React Suspense, Next.js dynamic, Vue async) to reduce initial load.

`third-party-scripts` — Load third-party scripts async/defer; audit and remove unnecessary ones.

`reduce-reflows` — Batch DOM reads then writes; avoid forced synchronous layout.

`content-jumping` — Reserve space for async content (skeleton sizing, spinner containers with fixed dimensions).

`virtualize-lists` — Virtualize lists with 50+ items. Never render thousands of DOM nodes.

`main-thread-budget` — Keep per-frame work under ~16ms for 60fps. Move heavy tasks (search indexing, image processing) off the main thread.

`progressive-loading` — Skeleton screens or shimmer for operations > 1s. Blocking spinners only for brief operations.

`input-latency` — Visual feedback within 100ms of tap. (Apple HIG)

`debounce-throttle` — Debounce input events; throttle scroll and resize handlers.

`offline-support` — Provide offline state messaging and a basic fallback. (PWA and mobile)

**Common anti-patterns:** uncompressed images; no code splitting; layout thrashing; rendering 500+ items without virtualization.

---

## Priority 4: Style Selection (HIGH)

`style-match` — Match visual style to product type and audience:

| Product type | Appropriate styles |
|---|---|
| Fintech / banking | Clean minimal, professional flat, muted palette |
| Healthcare | Calm minimal, soft tones, high legibility |
| Entertainment / social | Vibrant, bold, glassmorphism, dark mode options |
| SaaS / productivity | Modern flat, neutral tones, information density |
| E-commerce | Clean, high-contrast CTAs, product-focused |
| Creative / portfolio | Bold, experimental, brand-expressive |
| Gaming | Dark, immersive, neon or rich gradients |

`consistency` — Same visual language (style, radius, shadow, iconography) across all pages and components. No page-by-page style decisions.

`no-emoji-icons` — Use SVG icon sets (Heroicons, Lucide, Phosphor, SF Symbols, Material Icons). Never emoji for navigation or system controls.

`effects-match-style` — Shadows, blur, border-radius, and gradient choices must align with the chosen aesthetic. Don't mix flat and skeuomorphic randomly.

`platform-adaptive` — Respect platform idioms: iOS HIG navigation patterns (bottom tab bar, sheets), Material Design patterns (top app bar, FAB). Don't port iOS patterns to Android verbatim.

`state-clarity` — Hover, pressed, focused, and disabled states must be visually distinct while remaining on-brand. (Material state layers)

`elevation-consistent` — Define a consistent elevation / shadow scale. Never use ad-hoc shadow values per component.

`dark-mode-pairing` — Design light and dark variants together. Test contrast separately for each. Dark mode uses tonal palette shifts, not color inversion.

`icon-style-consistent` — One icon set throughout. Consistent stroke width. Consistent corner radius. Filled vs outline has semantic meaning — don't mix randomly.

`system-controls` — Prefer native/system controls (pickers, toggles, checkboxes) over fully custom ones. Customize only when branding requires it. (Apple HIG)

`blur-purpose` — Use blur (backdrop-filter) to indicate modal backgrounds or sheet dismissal, not as decoration. (Apple HIG)

`primary-action` — Each screen has one and only one primary CTA. Secondary actions must be visually subordinate.

---

## Priority 5: Layout & Responsive (HIGH)

`viewport-meta` — `<meta name="viewport" content="width=device-width, initial-scale=1">`. Never set `user-scalable=no`.

`mobile-first` — Design for 375px (small phone) first. Scale up to 768px (tablet), 1024px, 1440px.

`breakpoint-consistency` — Systematic breakpoints: `375 / 768 / 1024 / 1440`. Not arbitrary per-component breakpoints.

`readable-font-size` — Minimum 16px body text on mobile. Smaller triggers iOS auto-zoom.

`line-length-control` — 35–60 characters per line on mobile; 60–75 on desktop.

`horizontal-scroll` — Zero horizontal scroll on mobile. Content must fit viewport width.

`spacing-scale` — 4pt/8dp incremental spacing system throughout: margins, padding, gaps. No arbitrary values.

`touch-density` — Component spacing comfortable for touch — not cramped (mis-taps), not wasteful.

`container-width` — Consistent max-width on desktop. `max-w-6xl` (72rem) or `max-w-7xl` (80rem) are standard.

`z-index-management` — Define a layered z-index scale: `0 / 10 / 20 / 40 / 100 / 1000`. Shared constants, not guesswork.

`fixed-element-offset` — Fixed headers and bottom bars must reserve safe padding for underlying scrollable content.

`scroll-behavior` — Avoid nested scroll regions that conflict with the main scroll experience. One dominant scroll axis per screen.

`viewport-units` — Use `min-h-dvh` (dynamic viewport height) over `100vh` on mobile — iOS Safari's toolbar causes 100vh overflow.

`orientation-support` — Verify layout is readable and all controls are reachable in landscape mode.

`content-priority` — Show core content first on mobile; fold or progressively reveal secondary content.

`visual-hierarchy` — Establish hierarchy via size, spacing, and contrast — not color alone.

---

## Priority 6: Typography & Color (MEDIUM)

`line-height` — 1.5–1.75 for body text. Headings may use tighter line height (1.1–1.3).

`line-length` — Limit to 65–75 characters per line. Use `max-ch` containers on wide screens.

`font-pairing` — Match heading and body font personalities. Contrast is effective (geometric sans + humanist serif). Same-family pairings are safe.

`font-scale` — Consistent type scale: e.g., `12 / 14 / 16 / 18 / 24 / 32 / 48`. No arbitrary in-between sizes.

`contrast-readability` — Darker text on lighter backgrounds. Use `slate-900` on white, not `gray-400`.

`text-styles-system` — Use platform type roles: iOS Dynamic Type styles (caption/body/title/largeTitle); Material 5 type roles (labelSmall → displayLarge). Don't invent ad-hoc styles.

`weight-hierarchy` — Bold headings (600–700), Regular body (400), Medium labels (500). Use weight to reinforce visual hierarchy.

`color-semantic` — Define semantic tokens: `primary`, `secondary`, `error`, `warning`, `success`, `surface`, `on-surface`, `outline`. Never hardcode raw hex values in components.

`color-dark-mode` — Dark mode uses desaturated, lighter tonal variants — not inverted light-mode colors. Test contrast separately for each mode.

`color-accessible-pairs` — Every foreground/background pair must meet 4.5:1 (AA) or 7:1 (AAA). Verify with a contrast tool.

`color-not-decorative-only` — Functional colors (error red, success green) must include a supporting icon or text. Never color as the sole signal.

`truncation-strategy` — Prefer text wrapping over truncation. When truncation is necessary, use ellipsis and expose full text via tooltip or expand action. (Apple HIG)

`letter-spacing` — Respect platform default letter-spacing. Avoid tight tracking on body text. Wide tracking (0.05–0.1em) works for uppercase labels.

`number-tabular` — Use tabular/monospaced figures for data columns, prices, counters, and timers to prevent layout shift between values.

`whitespace-balance` — Use whitespace intentionally to group related items and separate sections. Avoid visual clutter from insufficient spacing.

---

## Priority 7: Animation (MEDIUM)

`duration-timing` — 150–300ms for micro-interactions. Complex transitions ≤400ms. Never > 500ms. (Material Design)

`transform-performance` — Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these trigger layout.

`loading-states` — Skeleton or progress indicator when loading exceeds 300ms.

`excessive-motion` — Animate 1–2 key elements per view at most. Animating everything creates chaos.

`easing` — `ease-out` (decelerate) for elements entering the screen. `ease-in` (accelerate) for elements leaving. Avoid `linear` for UI transitions.

`motion-meaning` — Every animation expresses a cause-effect relationship. Decorative-only animations waste user attention and increase cognitive load. (Apple HIG)

`state-transition` — Hover, active, expanded, collapsed, and modal state changes must animate smoothly, not snap.

`continuity` — Screen transitions maintain spatial continuity (shared elements, directional slide). The user must understand where they are in space. (Apple HIG)

`spring-physics` — Prefer spring / physics-based curves for natural, platform-native feel. (Apple HIG fluid animations)

`exit-faster-than-enter` — Exit animations run at ~60–70% of the enter duration. Waiting for things to leave feels slow. (Material Design motion)

`stagger-sequence` — Stagger list/grid item entrances by 30–50ms per item. Not all-at-once, not too slow.

`shared-element-transition` — Shared element / hero transitions for visual continuity between screens. (Material Design, Apple HIG)

`interruptible` — All animations must be immediately cancellable by user tap or gesture. (Apple HIG)

`no-blocking-animation` — Never block user input during an animation. The UI must stay interactive. (Apple HIG)

`fade-crossfade` — Use crossfade for content replacement within the same container. (Material Design)

`scale-feedback` — Subtle scale (0.95–1.05) on press for tappable cards and buttons; restore on release.

`gesture-feedback` — Drag, swipe, and pinch must provide real-time visual response tracking the finger exactly.

`hierarchy-motion` — Translate/scale direction expresses hierarchy: entering from below = going deeper; exiting upward = going back. (Material Design)

`motion-consistency` — Unified duration and easing tokens globally. All animations share the same rhythm.

`modal-motion` — Modals and sheets animate from their trigger source (scale+fade or slide-in) for spatial context. (Apple HIG, Material Design)

`navigation-direction` — Forward navigation animates left/up; backward animates right/down. Keep directional logic consistent. (Apple HIG)

`layout-shift-avoid` — Animations must not cause layout reflow or CLS. Use `transform` for position changes.

---

## Priority 8: Forms & Feedback (MEDIUM)

`input-labels` — Visible label per input, always. Placeholder text disappears on type — it is not a label.

`error-placement` — Error message displayed below the related field, not only in a global banner at top.

`submit-feedback` — Loading state on submit; then clear success or error state. Never a silent submit.

`required-indicators` — Mark required fields visually (asterisk `*` with legend; or mark optional fields if most are required).

`empty-states` — Helpful message with a clear next action when content is absent (first-time empty, search no-results, permission-denied).

`toast-dismiss` — Auto-dismiss informational toasts in 3–5s. Errors must be persistent and dismissible manually.

`confirmation-dialogs` — Confirm before all destructive or irreversible actions.

`input-helper-text` — Persistent helper text below complex inputs, not just placeholder. (Material Design)

`disabled-states` — Disabled elements: reduced opacity (0.38–0.5) + cursor change + `disabled` semantic attribute. (Material Design)

`progressive-disclosure` — Reveal complex options progressively. Don't front-load a form with every possible option.

`inline-validation` — Validate on blur, not on every keystroke. Show errors only after the user finishes typing.

`input-type-keyboard` — Use semantic `input type` attributes (`email`, `tel`, `number`, `search`) for correct mobile keyboard.

`password-toggle` — Provide show/hide toggle on password fields.

`autofill-support` — Use `autocomplete` attributes (web) / `textContentType` (iOS) / `autofillHints` (Android) for system autofill.

`undo-support` — Allow undo for destructive or bulk actions ("Undo delete" toast with action). (Apple HIG)

`success-feedback` — Confirm completed actions with brief visual feedback (checkmark, toast, color flash). (Material Design)

`error-recovery` — Error messages include a clear recovery path (retry, edit, help link). Not just "Something went wrong." (Apple HIG, Material Design)

`multi-step-progress` — Multi-step flows show a step indicator or progress bar; back navigation always available.

`form-autosave` — Long forms should auto-save drafts to prevent data loss on accidental dismissal. (Apple HIG)

`sheet-dismiss-confirm` — Confirm before dismissing a sheet or modal with unsaved changes. (Apple HIG)

`error-clarity` — Error messages state the cause AND how to fix it. "Email is required" is better than "Invalid input."

`field-grouping` — Group related fields logically (fieldset/legend or visual grouping with whitespace).

`focus-management` — After a failed submit, auto-focus the first invalid field. (WCAG, Material Design)

`error-summary` — For multiple errors, show a summary at top with anchor links to each invalid field. (WCAG)

`touch-friendly-input` — Mobile input height ≥44px to meet touch target requirements. (Apple HIG)

`destructive-emphasis` — Destructive actions (delete, cancel subscription) use semantic danger color and are spatially separated from primary actions. (Apple HIG, Material Design)

`toast-accessibility` — Toasts must not steal keyboard focus. Use `aria-live="polite"` for screen reader announcements. (WCAG)

`aria-live-errors` — Form error regions use `aria-live="assertive"` or `role="alert"` to notify screen readers. (WCAG)

`contrast-feedback` — Error and success state colors must meet 4.5:1 contrast ratio. (WCAG, Material Design)

`timeout-feedback` — Request timeouts show clear feedback with a retry action. Never silently fail. (Material Design)

---

## Priority 9: Navigation Patterns (HIGH)

`bottom-nav-limit` — Bottom navigation: max 5 items, each with icon + text label. More items need a different pattern.

`drawer-usage` — Drawers/sidebars for secondary navigation, not primary actions. (Material Design)

`back-behavior` — Back navigation is predictable, consistent, and preserves scroll position and filter state. (Apple HIG, Material Design)

`deep-linking` — Every key screen must be reachable via deep link or URL for sharing and push notifications. (Apple HIG, Material Design)

`tab-bar-ios` — iOS: bottom Tab Bar for top-level navigation. (Apple HIG)

`top-app-bar-android` — Android: Top App Bar with navigation icon for primary structure. (Material Design)

`nav-label-icon` — Navigation items have both icon and text label. Icon-only navigation is a discoverability anti-pattern. (Material Design)

`nav-state-active` — Current location highlighted in navigation (color, weight, underline, or indicator dot). (Apple HIG, Material Design)

`nav-hierarchy` — Primary nav (tabs, bottom bar) and secondary nav (drawer, settings) are clearly separated. Never mix levels.

`modal-escape` — Modals and sheets always offer a clear close/dismiss affordance. Support swipe-down to dismiss on mobile. (Apple HIG)

`search-accessible` — Search is easily reachable (top bar or dedicated tab). Provide recent and suggested queries. (Material Design)

`breadcrumb-web` — Web: use breadcrumbs for 3+ level deep hierarchies. (Material Design)

`state-preservation` — Back navigation restores previous scroll position, filter state, and input values. (Apple HIG, Material Design)

`gesture-nav-support` — Support iOS swipe-back and Android predictive back without conflict. (Apple HIG, Material Design)

`tab-badge` — Badges on nav items indicate unread/pending items; clear after user visits. Use sparingly. (Apple HIG, Material Design)

`overflow-menu` — When actions exceed available space, use an overflow/more menu instead of cramming.

`bottom-nav-top-level` — Bottom nav is for top-level screens only. Never nest sub-navigation inside it.

`adaptive-navigation` — Large screens (≥1024px): sidebar. Small screens: bottom or top nav. (Material Adaptive)

`back-stack-integrity` — Never silently reset the navigation stack or jump unexpectedly to home. (Apple HIG, Material Design)

`navigation-consistency` — Navigation placement is identical across all pages. Never change by page type.

`modal-vs-navigation` — Modals are not used for primary navigation flows. They break the user's navigation path. (Apple HIG)

`focus-on-route-change` — After page transitions, move keyboard focus to the main content region. (WCAG)

`persistent-nav` — Core navigation remains reachable from deep pages. Never hide it entirely in sub-flows. (Apple HIG, Material Design)

`destructive-nav-separation` — Dangerous actions (delete account, log out) visually and spatially separated from normal nav items. (Apple HIG, Material Design)

`empty-nav-state` — When a nav destination is unavailable, explain why rather than silently hiding it. (Material Design)

---

## Priority 10: Charts & Data (LOW)

`chart-type` — Match chart type to data: trend → line chart; comparison → bar chart; proportion → pie/donut (max 5 categories); distribution → histogram; relationship → scatter plot.

`color-guidance` — Use accessible palettes. Avoid red/green-only pairs (colorblindness). Add patterns or textures as a second differentiator. (WCAG, Material Design)

`data-table` — Provide a table alternative to charts for accessibility. Charts alone are not screen-reader friendly. (WCAG)

`legend-visible` — Always show a legend positioned near the chart, not detached below a scroll fold. (Material Design)

`tooltip-on-interact` — Hover (web) or tap (mobile) shows exact values with context. (Apple HIG, Material Design)

`axis-labels` — Label both axes with units and a readable scale. Avoid truncated or rotated labels on mobile.

`responsive-chart` — Charts reflow or simplify on small screens (horizontal bar instead of vertical, fewer tick marks).

`empty-data-state` — Meaningful empty state when no data ("No data yet" + guidance), not a blank chart frame. (Material Design)

`loading-chart` — Skeleton or shimmer while chart data loads. Never show an empty axis frame. (Material Design)

`animation-optional` — Chart entrance animations respect `prefers-reduced-motion`. Data must be readable immediately without animation. (Apple HIG)

`large-dataset` — For 1000+ data points, aggregate, sample, or virtualize. Provide drill-down for detail. (Material Design)

`number-formatting` — Locale-aware formatting for numbers, dates, and currencies on axes and labels. (Apple HIG, Material Design)

`touch-target-chart` — Interactive chart elements (points, bars, slices) must have a ≥44pt tap area or expand on touch. (Apple HIG)

`no-pie-overuse` — Avoid pie/donut for > 5 categories. Use a bar chart for clarity.

`contrast-data` — Data lines/bars vs background ≥3:1; data text labels ≥4.5:1. (WCAG)

`legend-interactive` — Chart legends should be clickable to toggle series visibility. (Material Design)

`direct-labeling` — For small datasets, label values directly on chart elements to reduce eye travel.

`tooltip-keyboard` — Tooltip content must be keyboard-reachable; not hover-only. (WCAG)

`sortable-table` — Data tables support sorting with `aria-sort` attribute reflecting current state. (WCAG)

`axis-readability` — Axis ticks must not be cramped. Auto-skip ticks on small screens.

`gridline-subtle` — Grid lines low-contrast (e.g., gray-200) so they don't compete with data.

`focusable-elements` — Interactive chart elements (points, bars, slices) are keyboard-navigable. (WCAG)

`screen-reader-summary` — Provide a text summary or `aria-label` describing the chart's key insight. (WCAG)

`error-state-chart` — Data load failure shows an error message with a retry action, not a broken empty chart.

`export-option` — Data-heavy products offer CSV or image export.

---

## Design System Creation Framework

### Step 1: Classify the Product

Identify the product type and audience before any design decisions:
- **Entertainment / social** — content-dense, immersive, dark mode priority, young audience
- **Productivity / SaaS** — information hierarchy, neutral palette, desktop-first
- **E-commerce** — product-forward, conversion-optimized, trust signals prominent
- **Healthcare / fintech** — calm, trustworthy, high legibility, conservative palette
- **Creative / portfolio** — brand-expressive, experimental typography acceptable

### Step 2: Select Style Direction

Match style to product type:

| Style | Use for |
|---|---|
| Clean minimal | SaaS, fintech, healthcare |
| Modern glassmorphism | Entertainment, social, dark-first |
| Bold flat | E-commerce, marketing, conversion |
| Soft/warm organic | Wellness, lifestyle, food, beauty |
| Technical/data | Developer tools, dashboards, analytics |
| Expressive/editorial | Creative, media, portfolio |

### Step 3: Define Color Tokens

Minimum semantic token set:

```
--color-primary          # Brand action color
--color-primary-hover    # Darker variant for hover
--color-secondary        # Supporting accent
--color-error            # Destructive / validation failure
--color-warning          # Caution state
--color-success          # Positive confirmation
--color-surface          # Card and panel background
--color-surface-elevated # Elevated cards, dropdowns
--color-background       # Page background
--color-on-surface       # Primary text on surface
--color-on-surface-muted # Secondary text on surface
--color-border           # Default border
--color-border-focus     # Focus ring
```

Define each token for both light and dark modes. Test contrast for every pairing.

### Step 4: Select Typography

Font pairing principles:
- **Contrast pairing**: geometric sans for headings + humanist serif for body (high visual contrast)
- **Harmony pairing**: two sans-serifs from the same family or with matching proportions
- **Expressive pairing**: display/slab serif for headings only; limit to hero sections

Type scale (example — 16px base):

| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 48–64px | 700 | Hero headings |
| `h1` | 36–48px | 700 | Page titles |
| `h2` | 28–36px | 600 | Section headings |
| `h3` | 22–28px | 600 | Subsection headings |
| `body-lg` | 18px | 400 | Lead paragraphs |
| `body` | 16px | 400 | Default body text |
| `body-sm` | 14px | 400 | Secondary text |
| `label` | 12–14px | 500 | Form labels, captions |
| `code` | 14px | 400 | Inline and block code |

### Step 5: Establish Spacing and Component Standards

Spacing scale (4pt base):
```
xs:   4px    (tight element spacing)
sm:   8px    (component internal spacing)
md:   16px   (standard padding)
lg:   24px   (section padding, card padding)
xl:   32px   (section separators)
2xl:  48px   (major section breaks)
3xl:  64px   (page-level spacing)
```

Component standards to define:
- Border radius scale (none / sm / md / lg / full)
- Shadow/elevation scale (flat / low / medium / high / dialog)
- Icon size scale (16 / 20 / 24 / 32 / 48px)
- Animation duration tokens (fast: 150ms / normal: 250ms / slow: 400ms)

---

## Pre-Delivery Checklist

### Visual Quality
- [ ] No emoji used as icons — SVG icon set used consistently
- [ ] All icons from one visual language (stroke weight, corner radius)
- [ ] Official brand assets used with correct proportions and clear space
- [ ] Semantic color tokens used — no hardcoded raw hex in components
- [ ] Light and dark modes tested separately; contrast passes in both
- [ ] Press/hover states do not shift layout or cause visual jitter

### Interaction
- [ ] All tappable elements provide press feedback within 80–150ms
- [ ] Touch targets ≥44×44pt (iOS) / ≥48×48dp (Android)
- [ ] Micro-interaction timing: 150–300ms with platform-native easing
- [ ] Disabled states visually clear, non-interactive, and semantically marked
- [ ] Screen reader focus order matches visual order; interactive labels are descriptive
- [ ] No nested/conflicting gesture regions

### Performance
- [ ] Images use WebP/AVIF with explicit dimensions
- [ ] CLS < 0.1 — no unexpected layout shifts
- [ ] Route-level code splitting in place
- [ ] Lists > 50 items virtualized
- [ ] Fonts use `font-display: swap`; critical fonts preloaded
- [ ] Third-party scripts async/deferred

### Accessibility
- [ ] Contrast ≥4.5:1 for body text in both light and dark mode
- [ ] Contrast ≥3:1 for large text and UI components
- [ ] All interactive controls keyboard accessible
- [ ] All meaningful images have descriptive alt text
- [ ] Heading hierarchy sequential (h1→h6, no skips)
- [ ] `prefers-reduced-motion` respected; animations disabled when requested
- [ ] Color never used as the only signal
- [ ] Form errors use `aria-live` or `role="alert"`

### Layout
- [ ] Safe areas respected (notch, Dynamic Island, gesture bar, status bar)
- [ ] Scroll content not hidden behind fixed/sticky bars
- [ ] No horizontal scroll on mobile (375px viewport)
- [ ] 4pt/8dp spacing rhythm maintained consistently
- [ ] Long-form text readable on large devices (not edge-to-edge)
- [ ] Tested on small phone (375px), large phone, tablet — portrait and landscape

---

## Professional UI Rules

### Icons

| Rule | Do | Avoid |
|---|---|---|
| No emoji as icons | SVG vector icons (Lucide, Phosphor, SF Symbols) | 🎨 🚀 ⚙️ for navigation or controls |
| Vector assets only | SVG or platform vector icons | Raster PNG icons that blur |
| Touch target minimum | 44×44pt interactive area; use hitSlop | Small icons without expanded hit area |
| Consistent sizing | Token-based sizes (icon-sm/md/lg) | Mixing 20pt / 24pt / 28pt arbitrarily |
| Stroke consistency | One stroke width per visual layer (1.5px or 2px) | Mixed thick/thin strokes |
| Filled vs outline | One style per hierarchy level | Mixing filled and outline at same level |
| Icon contrast | WCAG contrast: 4.5:1 small, 3:1 large glyphs | Low-contrast icons that fade into background |

### Light/Dark Mode Contrast

| Check | Do | Avoid |
|---|---|---|
| Surface readability | Cards clearly separated from background | Overly transparent surfaces that blur hierarchy |
| Body text (light mode) | ≥4.5:1 against light surface | Low-contrast gray-on-white body text |
| Body text (dark mode) | ≥4.5:1 on dark surface; secondary ≥3:1 | Dark text blending into dark background |
| Borders and dividers | Visible in both themes | Theme-specific borders disappearing in one mode |
| State contrast | Hover/focus/disabled equally distinguishable both modes | Interaction states defined for light mode only |
| Token-driven | Semantic color tokens mapped per theme | Per-screen hardcoded hex values |
| Modal scrim | 40–60% opacity black overlay | Weak scrim leaving background competing with foreground |

### Layout Discipline

| Check | Do | Avoid |
|---|---|---|
| Safe areas | Respect top/bottom safe areas for all fixed elements | Fixed UI under notch, status bar, or gesture area |
| Spacing rhythm | 4/8dp system for padding, gaps, sections | Random spacing increments |
| Content width | Predictable width per device class | Arbitrary widths between screens |
| Scroll + fixed | Add insets so lists aren't hidden behind bars | Scroll content obscured by sticky headers/footers |
| Readable measure | Max-ch on wide devices for long text | Edge-to-edge paragraphs on tablets |
| Adaptive gutters | Increase horizontal insets on wider viewports | Same narrow gutter on all screen sizes |
