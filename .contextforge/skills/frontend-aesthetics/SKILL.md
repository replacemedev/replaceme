# Frontend Aesthetics

Create distinctive, production-grade frontend interfaces that reject generic aesthetics. Implement real working code with exceptional attention to creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

---

## Design Thinking

Before coding, understand the context and commit to a **bold aesthetic direction**:

1. **Purpose:** What problem does this interface solve? Who uses it?
2. **Tone:** Pick an extreme. Options include:
   - Brutally minimal / maximalist chaos
   - Retro-futuristic / organic/natural
   - Luxury/refined / playful/toy-like
   - Editorial/magazine / brutalist/raw
   - Art deco/geometric / soft/pastel
   - Industrial/utilitarian
   - ...or invent one true to the context

3. **Constraints:** Technical requirements (framework, performance, accessibility).
4. **Differentiation:** What makes this unforgettable? What's the one thing someone will remember?

**CRITICAL:** Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

## Frontend Aesthetics Guidelines

### Typography

Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter. Pair a distinctive display font with a refined body font.

**Font pairing examples by aesthetic:**

```css
/* Editorial luxury */
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-body:    'Jost', 'Helvetica Neue', sans-serif;

/* Technical / developer */
--font-display: 'Space Mono', monospace;
--font-body:    'IBM Plex Sans', sans-serif;

/* Bold / impact */
--font-display: 'Bebas Neue', sans-serif;
--font-body:    'Work Sans', sans-serif;

/* Playful / warm */
--font-display: 'Fraunces', serif;
--font-body:    'Nunito', sans-serif;

/* High fashion */
--font-display: 'PP Editorial New', 'Playfair Display', serif;
--font-body:    'Neue Montreal', 'Helvetica Neue', sans-serif;

/* Brutalist / raw */
--font-display: 'Anton', 'Impact', sans-serif;
--font-body:    'DM Mono', monospace;
```

**Type scale:**
```css
:root {
  --text-hero: clamp(3.5rem, 8vw, 7rem);    /* viewport-responsive */
  --text-2xl:  2rem;
  --text-xl:   1.5rem;
  --text-base: 1.0625rem;                    /* slightly generous */
  --text-sm:   0.875rem;
  --text-xs:   0.75rem;
}

/* Optical refinement */
.headline { letter-spacing: -0.03em; text-wrap: balance; }
.label    { letter-spacing: 0.12em;  text-transform: uppercase; font-size: 0.75rem; }
```

---

### Color & Theme

Commit to a cohesive aesthetic using CSS variables. Dominant colors with sharp accents outperform timid, evenly distributed palettes.

```css
/* Dark industrial */
:root {
  --bg:       #0c0c0c;
  --surface:  #161616;
  --border:   #2a2a2a;
  --text:     #f0ece4;
  --muted:    #6b6560;
  --accent:   #e8c547;    /* gold — one dominant accent */
  --accent-2: #c94a1e;    /* burned orange — sharp secondary */
}

/* Luxury cream */
:root {
  --bg:       #f5f0e8;
  --surface:  #ffffff;
  --border:   #e0d8cc;
  --text:     #1a1208;
  --muted:    #8a7d6a;
  --accent:   #1a1208;    /* near-black — refined */
  --accent-2: #8b6f3e;    /* warm bronze */
}

/* Retro-futuristic */
:root {
  --bg:       #050510;
  --surface:  #0d0d1a;
  --border:   #1e1e3a;
  --text:     #e8e4f0;
  --muted:    #6a6580;
  --accent:   #00ffe7;    /* cyan — electric primary */
  --accent-2: #ff6b9d;    /* pink — complementary pop */
}
```

---

### Motion & Animation

Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use the Motion library (`motion/react`) for React.

**Page load stagger — most impactful single animation:**
```css
.hero-eyebrow { animation: reveal 0.5s ease-out 0.0s both; }
.hero-title   { animation: reveal 0.6s ease-out 0.1s both; }
.hero-sub     { animation: reveal 0.6s ease-out 0.3s both; }
.hero-cta     { animation: reveal 0.5s ease-out 0.5s both; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(1.25rem); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Scroll-triggered reveal with IntersectionObserver:**
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible')
  })
}, { threshold: 0.15 })

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
```
```css
[data-reveal] { opacity: 0; transform: translateY(2rem); transition: opacity 0.6s ease, transform 0.6s ease; }
[data-reveal].visible { opacity: 1; transform: none; }
```

**Magnetic button (React):**
```tsx
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current!.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }

  const handleMouseLeave = () => {
    ref.current!.style.transform = 'translate(0, 0)'
  }

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease' }}
    >
      {children}
    </button>
  )
}
```

**Always include reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Spatial Composition

Use unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

```css
/* Asymmetric hero — large left, tight right */
.hero {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0;
  min-height: 100svh;
  align-items: end;
  padding: 0 0 10vh 8vw;
}

/* Overlapping decorative element */
.feature-card {
  position: relative;
}
.feature-number {
  position: absolute;
  top: -0.5em;
  right: 1rem;
  font-size: clamp(5rem, 12vw, 10rem);
  line-height: 1;
  color: var(--accent);
  opacity: 0.08;
  font-weight: 900;
  pointer-events: none;
  user-select: none;
}

/* Diagonal section divider */
.section-divider {
  height: 120px;
  background: var(--bg-next);
  clip-path: polygon(0 60%, 100% 0, 100% 100%, 0 100%);
  margin-top: -60px;
}
```

---

### Backgrounds & Visual Details

Create atmosphere and depth rather than defaulting to flat colors.

**Gradient mesh:**
```css
.bg-mesh {
  background:
    radial-gradient(ellipse at 15% 50%, oklch(45% 0.2 260 / 0.25) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 15%, oklch(55% 0.18 30  / 0.18) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 90%, oklch(40% 0.15 200 / 0.15) 0%, transparent 50%),
    var(--bg);
}
```

**Noise texture overlay:**
```css
/* Add a subtle grain over everything */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
  z-index: 9999;
}
```

**Geometric dot/grid pattern:**
```css
.bg-grid {
  background-image:
    radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 32px 32px;
}

.bg-lines {
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 79px,
      var(--border) 79px,
      var(--border) 80px
    );
}
```

**Expressive shadows:**
```css
/* Dramatic card elevation */
.card-elevated {
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06),
    0 8px 24px rgba(0,0,0,0.4),
    0 32px 80px rgba(0,0,0,0.3);
}

/* Accent glow */
.card-glow {
  box-shadow:
    0 0 0 1px var(--accent),
    0 0 40px color-mix(in srgb, var(--accent) 20%, transparent);
}
```

---

## What to Avoid

| Generic | Distinctive alternative |
|---------|------------------------|
| Inter, Roboto, Arial as display | Cormorant, Bebas Neue, Space Mono, Fraunces |
| Purple/blue gradients on white | Committed dark palette with warm accent |
| Symmetric hero centered text | Asymmetric layout, off-grid type |
| Gray card grid with icons | Typographic hierarchy, bold numbering, or image-led |
| Equal-weight neutral palette | One dominant color, one sharp accent |
| Flat white/light gray backgrounds | Mesh gradient, noise overlay, pattern |
| Standard drop-shadow cards | Dramatic shadow + border or glow effect |
| Smooth entrance animations everywhere | Orchestrated stagger on page load only |

---

## Code Implementation Notes

- **HTML/CSS/JS:** Use CSS custom properties, `@keyframes`, and `IntersectionObserver`. No build step needed.
- **React:** Use `motion/react` for animations. CVA for component variants. Avoid inline styles except for dynamic values.
- **Vue:** Use `<Transition>` and `<TransitionGroup>` for enters/exits. CSS variables via `:root` in global styles.
- **Performance:** `will-change: transform` only on actively animating elements. Remove it after animation ends. Use `contain: layout` on heavy sections.
- **Accessibility:** All animated content respects `prefers-reduced-motion`. Color contrast meets WCAG AA. Interactive elements have visible focus states.
