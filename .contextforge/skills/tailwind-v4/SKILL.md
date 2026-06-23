# Tailwind Design System (v4)

Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, responsive patterns, and accessibility.

> **Targets Tailwind CSS v4 (2024+).** For v3 projects, refer to the migration section at the end of this document.

## When to Use

- Creating a component library with Tailwind v4
- Implementing design tokens and theming with CSS-first configuration
- Building responsive and accessible components
- Standardizing UI patterns across a codebase
- Migrating from Tailwind v3 to v4
- Setting up dark mode with native CSS features

---

## Key v4 Changes

| v3 Pattern | v4 Pattern |
|---|---|
| `tailwind.config.ts` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *))` |
| `theme.extend.colors` | `@theme { --color-*: value }` |
| `require("tailwindcss-animate")` | CSS `@keyframes` in `@theme` + `@starting-style` |

---

## Quick Start — Full @theme Setup

```css
/* app.css — Tailwind v4 CSS-first configuration */
@import "tailwindcss";

@theme {
  /* Semantic color tokens using OKLCH for better color perception */
  --color-background:   oklch(100%   0      0  );
  --color-foreground:   oklch(14.5%  0.025  264);

  --color-primary:               oklch(14.5%  0.025  264);
  --color-primary-foreground:    oklch(98%    0.01   264);

  --color-secondary:             oklch(96%    0.01   264);
  --color-secondary-foreground:  oklch(14.5%  0.025  264);

  --color-muted:                 oklch(96%    0.01   264);
  --color-muted-foreground:      oklch(46%    0.02   264);

  --color-accent:                oklch(96%    0.01   264);
  --color-accent-foreground:     oklch(14.5%  0.025  264);

  --color-destructive:           oklch(53%    0.22    27);
  --color-destructive-foreground: oklch(98%   0.01   264);

  --color-border:       oklch(91%    0.01   264);
  --color-ring:         oklch(14.5%  0.025  264);
  --color-ring-offset:  oklch(100%   0      0  );

  --color-card:              oklch(100%   0      0  );
  --color-card-foreground:   oklch(14.5%  0.025  264);

  /* Radius tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Animation tokens — @keyframes inside @theme are output when referenced */
  --animate-fade-in:   fade-in   0.2s ease-out;
  --animate-fade-out:  fade-out  0.2s ease-in;
  --animate-slide-in:  slide-in  0.3s ease-out;
  --animate-slide-out: slide-out 0.3s ease-in;

  @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }

  @keyframes slide-in {
    from { transform: translateY(-0.5rem); opacity: 0; }
    to   { transform: translateY(0);       opacity: 1; }
  }
  @keyframes slide-out {
    from { transform: translateY(0);       opacity: 1; }
    to   { transform: translateY(-0.5rem); opacity: 0; }
  }
}

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Dark mode token overrides */
.dark {
  --color-background:  oklch(14.5% 0.025 264);
  --color-foreground:  oklch(98%   0.01  264);

  --color-primary:               oklch(98%   0.01  264);
  --color-primary-foreground:    oklch(14.5% 0.025 264);

  --color-secondary:             oklch(22%   0.02  264);
  --color-secondary-foreground:  oklch(98%   0.01  264);

  --color-muted:                 oklch(22%   0.02  264);
  --color-muted-foreground:      oklch(65%   0.02  264);

  --color-accent:                oklch(22%   0.02  264);
  --color-accent-foreground:     oklch(98%   0.01  264);

  --color-destructive:           oklch(42%   0.15   27);
  --color-destructive-foreground: oklch(98%  0.01  264);

  --color-border:      oklch(22%   0.02  264);
  --color-ring:        oklch(83%   0.02  264);
  --color-ring-offset: oklch(14.5% 0.025 264);

  --color-card:              oklch(14.5% 0.025 264);
  --color-card-foreground:   oklch(98%   0.01  264);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground antialiased; }
}
```

---

## Core Concepts

### Design Token Hierarchy

```
Brand Tokens (abstract)
    └── Semantic Tokens (purpose)
            └── Component Tokens (specific)

Example:
    oklch(45% 0.2 260)  →  --color-primary  →  bg-primary
```

### Component Architecture

```
Base styles → Variants → Sizes → States → Overrides
```

---

## Pattern 1: CVA Component Variants

```tsx
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:     'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-9 rounded-md px-3',
        lg:      'h-11 rounded-md px-8',
        icon:    'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// React 19: ref is a plain prop, no forwardRef needed
export function Button({
  className, variant, size, asChild = false, ref, ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
}

// Usage
<Button variant="destructive" size="lg">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button asChild><Link href="/home">Home</Link></Button>
```

---

## Pattern 2: Compound Components (React 19)

```tsx
// components/ui/card.tsx
import { cn } from '@/lib/utils'

export function Card({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />
  )
}

export function CardHeader({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
}

export function CardTitle({ className, ref, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) {
  return <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
}

export function CardDescription({ className, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) {
  return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Account</CardTitle>
    <CardDescription>Manage your account settings.</CardDescription>
  </CardHeader>
  <CardContent><form>...</form></CardContent>
  <CardFooter><Button>Save</Button></CardFooter>
</Card>
```

---

## Pattern 3: Form Components with Accessibility

```tsx
// components/ui/input.tsx
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  ref?: React.Ref<HTMLInputElement>
}

export function Input({ className, type, error, ref, id, ...props }: InputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Usage with React Hook Form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} error={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} error={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  )
}
```

---

## Pattern 4: Responsive Grid System

```tsx
// components/ui/grid.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    },
    gap: {
      none: 'gap-0',
      sm:   'gap-2',
      md:   'gap-4',
      lg:   'gap-6',
      xl:   'gap-8',
    },
  },
  defaultVariants: { cols: 3, gap: 'md' },
})

interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap, className }))} {...props} />
}

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm:   'max-w-screen-sm',
      md:   'max-w-screen-md',
      lg:   'max-w-screen-lg',
      xl:   'max-w-screen-xl',
      '2xl':'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: { size: 'xl' },
})

export function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size, className }))} {...props} />
}

// Usage
<Container>
  <Grid cols={4} gap="lg">
    {products.map(p => <ProductCard key={p.id} product={p} />)}
  </Grid>
</Container>
```

---

## Pattern 5: Native CSS Animations

```css
/* app.css — entry animations using @starting-style */
.dialog-overlay {
  opacity: 1;
  transition: opacity 0.2s, display 0.2s allow-discrete;

  @starting-style {
    opacity: 0;
  }
}

.dialog-overlay:not([open]) {
  opacity: 0;
}

.dialog-content {
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.3s ease-out, opacity 0.3s, display 0.3s allow-discrete;

  @starting-style {
    transform: translateY(-1rem);
    opacity: 0;
  }
}

.dialog-content:not([open]) {
  transform: translateY(-1rem);
  opacity: 0;
}
```

---

## Pattern 6: Dark Mode with ThemeProvider

```tsx
// components/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children, defaultTheme = 'system' }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') as Theme) : null) ?? defaultTheme
  )

  useEffect(() => {
    const root = document.documentElement
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme

    root.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', theme)

    // Update meta theme-color
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolved === 'dark' ? '#0a0a0a' : '#ffffff')
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
```

---

## Utility Functions

```ts
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared focus ring — apply to all interactive elements
export const focusRing = cn(
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-ring focus-visible:ring-offset-2'
)

// Shared disabled state
export const disabled = 'disabled:pointer-events-none disabled:opacity-50'
```

---

## Advanced CSS Patterns

### Custom @utility Directives

```css
/* Reusable CSS utility classes */
@utility decorative-line {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.25rem;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--color-primary);
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
}

@utility text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Theme Modifiers

```css
/* @theme inline — references other CSS variables (not output as standalone) */
@theme inline {
  --color-button-bg: var(--color-primary);
}

/* @theme static — always output even if not used */
@theme static {
  --color-brand: oklch(62% 0.2 260);
}

/* Clear default Tailwind color scale before defining your own */
@theme {
  --color-*: initial;
  --color-primary: oklch(14.5% 0.025 264);
}
```

### Semi-transparent Variants with color-mix()

```css
@theme {
  --color-primary-10: color-mix(in oklch, var(--color-primary) 10%, transparent);
  --color-primary-20: color-mix(in oklch, var(--color-primary) 20%, transparent);
  --color-primary-50: color-mix(in oklch, var(--color-primary) 50%, transparent);
}
```

### Container Queries

```css
@theme {
  --container-sm: 20rem;
  --container-md: 28rem;
  --container-lg: 32rem;
  --container-xl: 36rem;
}
```

```tsx
// Component-level responsiveness, independent of viewport
<div className="@container">
  <div className="flex flex-col @md:flex-row gap-4">
    ...
  </div>
</div>
```

---

## v3 → v4 Migration Checklist

- [ ] Move `tailwind.config.ts` theme extensions to `@theme {}` blocks in CSS
- [ ] Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`
- [ ] Replace `darkMode: "class"` with `@custom-variant dark (&:where(.dark, .dark *))`
- [ ] Convert hex/HSL color values to OKLCH
- [ ] Remove `tailwindcss-animate` plugin — implement `@keyframes` in `@theme` + `@starting-style`
- [ ] Remove `forwardRef` wrappers (React 19 only) — accept `ref` as a plain prop
- [ ] Clear default color scales with `--color-*: initial` before custom tokens
- [ ] Move `space-x-*`/`space-y-*` to `flex gap-*`
- [ ] Replace `w-N h-N` with `size-N` where applicable
- [ ] Update `@apply` directives if any relied on removed v3 utilities

---

## Best Practices

**Do:**
- Define all colors as OKLCH tokens in `@theme`
- Use semantic token names (`--color-primary`, `--color-muted-foreground`)
- Build components with CVA for variant management
- Use `cn()` everywhere for class merging
- Include ARIA attributes on all interactive form elements
- Use `@starting-style` for smooth overlay entry animations
- Write mobile-first responsive styles

**Don't:**
- Use `tailwind.config.ts` for new v4 projects
- Use `dark:` classes in component files — override tokens in `.dark {}`
- Use raw hex/HSL color values in `@theme`
- Use `tailwindcss-animate` plugin in v4
- Use `forwardRef` in React 19 codebases
- Use `space-x-*` / `space-y-*` — use `flex gap-*`
- Hardcode `z-index` on overlay components (Dialog, Sheet, Popover)
