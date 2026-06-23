---
description: Distinctive frontend interfaces — design thinking, typography, color, motion, and anti-generic-AI-aesthetics rules.
alwaysApply: false
---

## Frontend Aesthetics

Apply when building frontend interfaces, components, or pages. Produce working, production-grade code.

**CRITICAL — Design Direction First:** Before writing code: commit to a purpose, a bold tone (pick an extreme: brutalist, maximalist, luxury, retro-futuristic, editorial, playful, industrial, etc.), and one unforgettable differentiator. Match code complexity to vision.

**CRITICAL — Never use:**
- Inter, Roboto, Arial, or Space Grotesk as the display font
- Purple/blue gradients on white backgrounds
- Generic hero → features grid → CTA → footer layout
- Evenly-distributed neutral palettes with no dominant color
- Same aesthetic choices across different designs — vary radically

**HIGH — Typography:** Distinctive display font paired with a refined body font. Headlines at `clamp(3.5rem, 8vw, 7rem)`. Negative letter-spacing on large text (`-0.03em`). `text-wrap: balance`. Uppercase labels with `0.12em` tracking.

**HIGH — Color:** CSS variables for everything. One dominant color, one sharp accent. Commit fully to dark or light. Color meaning aligned to aesthetic context.

**MEDIUM — Motion:** One orchestrated page-load stagger > scattered micro-interactions. CSS-first. One surprising scroll/hover moment. `prefers-reduced-motion` override always.

**MEDIUM — Spatial Composition:** Asymmetry, overlapping elements, grid-breaking moments, viewport-relative sizing. Negative space is intentional design.

**MEDIUM — Visual Details:** No flat solid backgrounds — add gradient mesh, noise texture, or geometric pattern. `opacity: 0.03–0.06` grain overlay. Expressive, context-specific shadows and borders.

### Aesthetic Tone Reference

| Tone | Display Font | Palette Character | Layout |
|------|-------------|------------------|--------|
| Luxury/Editorial | Cormorant Garamond | Cream + near-black | Asymmetric, generous space |
| Retro-futuristic | Space Mono | Dark navy + electric cyan | Grid-heavy, diagonal cuts |
| Brutalist/Raw | Bebas Neue / Anton | Black + one raw accent | Oversized type, broken grid |
| Playful | Fraunces | Warm off-white + bright | Rounded, bouncy, layered |
| Industrial | DM Mono | Dark gray + amber | Dense, monospaced, structured |
