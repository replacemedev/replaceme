---
name: Verdant Professional
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#2e6a41'
  on-tertiary: '#ffffff'
  tertiary-container: '#7cba8a'
  on-tertiary-container: '#074a25'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#b1f2be'
  tertiary-fixed-dim: '#96d5a3'
  on-tertiary-fixed: '#00210d'
  on-tertiary-fixed-variant: '#12512c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  canvas: '#FFFFFF'
  surface-subdued: '#F8FAFC'
  surface-mint: '#F0FDF4'
  border-subtle: '#E2E8F0'
  ink-secondary: '#334155'
  ink-muted: '#64748B'
  success: '#22C55E'
  info: '#3B82F6'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.015em
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 96px
  container-max: 1280px
---

## Brand & Style

The design system is defined by a philosophy of **Organic Precision**. It balances the energetic, growth-oriented vitality of vibrant greens with the authoritative stability of deep forest tones. The aesthetic is rooted in **Corporate Modernism**, prioritizing high-fidelity clarity, expansive whitespace, and a sophisticated "tech-forward" approachable character. 

The UI should evoke a sense of trust, efficiency, and premium quality. It avoids heavy skeuomorphism in favor of subtle depth, utilizing soft shadows and high-contrast typography to create a tiered information hierarchy that feels both airy and structurally sound. This system is tailored for a professional audience that values speed, accessibility, and modern aesthetics.

## Colors

The palette is anchored by **Vibrant Emerald (#22C55E)**, used strategically for primary actions and status indicators to symbolize growth. This is balanced by **Deep Forest Emerald (#064E3B)**, which provides the necessary gravitas for headlines and structural anchors.

The background strategy relies on a "Pure Snow" canvas to maximize light and breathability. **Surface Mint** is used as a functional tint to highlight active containers or callouts without introducing the heaviness of gray scales. Typography uses **Slate Obsidian** rather than pure black to maintain a high-fidelity, softer reading experience while ensuring maximum accessibility contrast ratios.

## Typography

This system employs a dual-font strategy: **Plus Jakarta Sans** for high-impact display roles and **Inter** for functional reading. 

Headlines utilize aggressive negative letter-spacing to create a tight, editorial aesthetic common in premium tech platforms. The body text is optimized for long-form legibility with a generous `1.6` line height. Small meta-information (like pricing, tags, or categories) uses **JetBrains Mono** in all-caps to provide a technical, precise "anchor" within the layout.

## Layout & Spacing

The layout follows a **12-column fluid grid** with a maximum content width of 1280px. A generous whitespace strategy is core to the identity—sections are separated by 96px of vertical padding to ensure distinct content grouping.

The grid adapts from a 12-column desktop view to a single-column mobile view at the 768px breakpoint. Asymmetric layouts are encouraged in hero sections (e.g., 7-column content / 5-column visual) to create dynamic movement. Internal card spacing relies on a 24px (gap-6) rhythm to maintain consistency across the interface.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layering** and **Ambient Shadows**. Surfaces sit on the white canvas with either a hairline border (#E2E8F0) or a very soft, diffused shadow.

Interactive elements (like cards) use "Glow Elevation": upon hover, they translate -4px on the Y-axis and gain a subtle shadow tinted with the primary emerald color (`rgba(34,197,94,0.15)`). The navigation bar uses a **Glassmorphism** effect with a 90% white opacity and a `backdrop-blur-md` to maintain context of the content beneath while providing a clear interactive surface.

## Shapes

The design system uses a "Rounded" shape language to convey friendliness and modernity. Standard components like buttons and inputs use `12px` (rounded-xl) corners. 

Primary containers and interactive cards use a more exaggerated `16px` (rounded-2xl) radius to create an organic, approachable feel. Pill-shaped rounding is reserved exclusively for status badges, tags, and small "eyebrow" labels to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Vibrant Emerald (#22C55E) with white text. Features a 12px corner radius and an emerald-tinted drop shadow. Scale slightly (1.02x) on hover.
- **Secondary:** Solid Deep Forest Emerald (#064E3B) with white text. Used for secondary high-priority actions.
- **Outline:** 1px border in #22C55E with text in #16A34A. Fills with Surface Mint (#F0FDF4) on hover.

### Cards & Inputs
- **Interactive Cards:** White background, hairline border (#E2E8F0). On hover, border shifts to Emerald and card elevates.
- **Input Fields:** 52px height, 12px corner radius. Focus state utilizes a 3px outer ring in transparent Emerald (`rgba(34,197,94,0.15)`).

### Specialized Elements
- **Status Pills:** Small uppercase labels using JetBrains Mono. Use Surface Mint background with Deep Green text for positive/active states.
- **Navigation:** Sticky floating bar with backdrop blur. Active links indicated by a 2px Emerald underline or a small dot indicator.
- **Candidate Mockups:** Use asymmetric layouts within cards, featuring circular avatars with "Active" status rings in the bottom-right corner.