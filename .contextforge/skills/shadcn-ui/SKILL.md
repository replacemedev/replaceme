# shadcn/ui

A framework for building UI, components, and design systems. Components are added as source code to the user's project via the CLI.

**IMPORTANT:** Run all CLI commands using the project's package runner — `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager`. Examples below use `npx shadcn@latest`; substitute the correct runner for the project.

## Project Context

Run this to get the project config and installed components:
```sh
npx shadcn@latest info --json
```

Use `npx shadcn@latest docs <component>` to get documentation and example URLs for any component.

## Principles

- **Use existing components first.** Run `npx shadcn@latest search` to check registries before writing custom UI. Check community registries too.
- **Compose, don't reinvent.** Settings page = Tabs + Card + form controls. Dashboard = Sidebar + Card + Chart + Table.
- **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.
- **Use semantic colors.** `bg-primary`, `text-muted-foreground` — never raw values like `bg-blue-500`.

---

## Critical Rules

### Styling & Tailwind

`styling-layout-only` — `className` for layout, not styling. Never override component colors or typography.
```tsx
// Bad
<Button className="bg-blue-500 text-white">Click</Button>
// Good
<Button className="w-full mt-4">Click</Button>
```

`styling-no-space-utilities` — No `space-x-*` or `space-y-*`. Use `flex` with `gap-*`. For vertical stacks, `flex flex-col gap-*`.
```tsx
<div className="flex flex-col gap-4">...</div>   // correct
<div className="space-y-4">...</div>              // wrong
```

`styling-size-shorthand` — Use `size-*` when width and height are equal. `size-10` not `w-10 h-10`.
```tsx
<Avatar className="size-10" />    // correct
<Avatar className="w-10 h-10" /> // wrong
```

`styling-truncate-shorthand` — Use `truncate`. Not `overflow-hidden text-ellipsis whitespace-nowrap`.

`styling-semantic-colors` — No manual `dark:` color overrides. Use semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `bg-muted`).

`styling-cn-conditional` — Use `cn()` for conditional classes. Don't write manual template literal ternaries.
```tsx
// Good
<div className={cn('border rounded', isActive && 'border-primary bg-primary/10')} />
```

`styling-no-manual-z-index` — No manual `z-index` on overlay components. Dialog, Sheet, Popover, Tooltip, DropdownMenu handle their own stacking context.

---

### Forms & Inputs

`forms-field-group` — Forms use `FieldGroup + Field`. Never use raw div with `space-y-*` or `grid gap-*` for form layout.
```tsx
// Bad
<div className="space-y-4">
  <div><Label htmlFor="name">Name</Label><Input id="name" /></div>
</div>

// Good
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <Input id="name" />
  </Field>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
  </Field>
</FieldGroup>
```

`forms-input-group-components` — `InputGroup` uses `InputGroupInput` / `InputGroupTextarea`. Never raw `Input` or `Textarea` inside `InputGroup`.
```tsx
// Bad
<InputGroup><Input placeholder="Search" /></InputGroup>
// Good
<InputGroup><InputGroupInput placeholder="Search" /></InputGroup>
```

`forms-input-addon` — Buttons inside inputs use `InputGroup + InputGroupAddon`.
```tsx
<InputGroup>
  <InputGroupInput placeholder="Enter URL" />
  <InputGroupAddon>
    <Button size="sm" variant="ghost">Copy</Button>
  </InputGroupAddon>
</InputGroup>
```

`forms-toggle-group` — Option sets with 2–7 choices use `ToggleGroup + ToggleGroupItem`. Don't loop `Button` with manual active state tracking.
```tsx
<ToggleGroup type="single" value={view} onValueChange={setView}>
  <ToggleGroupItem value="list">List</ToggleGroupItem>
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="card">Card</ToggleGroupItem>
</ToggleGroup>
```

`forms-fieldset` — Use `FieldSet + FieldLegend` for grouping related checkboxes/radios. Not a div with a heading.
```tsx
<FieldSet>
  <FieldLegend>Notification preferences</FieldLegend>
  <Field>
    <Checkbox id="email-notifs" />
    <FieldLabel htmlFor="email-notifs">Email</FieldLabel>
  </Field>
  <Field>
    <Checkbox id="sms-notifs" />
    <FieldLabel htmlFor="sms-notifs">SMS</FieldLabel>
  </Field>
</FieldSet>
```

`forms-validation-attributes` — Field validation uses `data-invalid` + `aria-invalid`. `data-invalid` on `Field`, `aria-invalid` on the control. For disabled: `data-disabled` on `Field`, `disabled` on the control.
```tsx
// Invalid
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Enter a valid email address.</FieldDescription>
</Field>

// Disabled
<Field data-disabled>
  <FieldLabel>Email</FieldLabel>
  <Input disabled />
</Field>
```

---

### Component Composition

`composition-items-in-groups` — Items always inside their Group.
- `SelectItem` → `SelectGroup`
- `DropdownMenuItem` → `DropdownMenuGroup`
- `CommandItem` → `CommandGroup`
- `MenubarItem` → `MenubarGroup`
```tsx
<Select>
  <SelectGroup>
    <SelectLabel>Regions</SelectLabel>
    <SelectItem value="us-east">US East</SelectItem>
    <SelectItem value="eu-west">EU West</SelectItem>
  </SelectGroup>
</Select>
```

`composition-aschild-render` — Use `asChild` (radix base) or `render` (base library) for custom triggers. Check the `base` field from `npx shadcn@latest info`.
```tsx
// Radix
<DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger>

// Base library
<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
```

`composition-overlay-title` — Dialog, Sheet, and Drawer always need a Title for accessibility. Use `className="sr-only"` if it should be visually hidden.
```tsx
<Dialog>
  <DialogContent>
    <DialogTitle className="sr-only">Delete confirmation</DialogTitle>
    ...
  </DialogContent>
</Dialog>
```

`composition-card-structure` — Use full Card composition. Don't dump everything in `CardContent`.
```tsx
<Card>
  <CardHeader>
    <CardTitle>Monthly Revenue</CardTitle>
    <CardDescription>Compared to last month.</CardDescription>
  </CardHeader>
  <CardContent>
    <Chart data={revenueData} />
  </CardContent>
  <CardFooter className="text-sm text-muted-foreground">
    Updated 2 minutes ago
  </CardFooter>
</Card>
```

`composition-button-loading` — `Button` has no `isPending` or `isLoading` prop. Compose with `Spinner` + `data-icon` + `disabled`.
```tsx
<Button disabled={isPending} onClick={handleSave}>
  {isPending && <Spinner data-icon="inline-start" />}
  {isPending ? 'Saving…' : 'Save changes'}
</Button>
```

`composition-tabs-structure` — `TabsTrigger` must be inside `TabsList`. Never render triggers directly in `Tabs`.
```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="security">...</TabsContent>
</Tabs>
```

`composition-avatar-fallback` — `Avatar` always needs `AvatarFallback` for when the image fails to load.
```tsx
<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>
```

`composition-use-components` — Use existing components before custom markup.

| Need | Use |
|------|-----|
| Callout / info box | `Alert` with `variant` |
| Empty state | `Empty` |
| Toast notification | `toast()` from `sonner` |
| Divider | `Separator` |
| Loading placeholder | `Skeleton` |
| Status label | `Badge` |

```tsx
// Bad — custom styled divs
<div className="rounded border border-amber-300 bg-amber-50 p-4">Warning: ...</div>
<div className="animate-pulse bg-muted h-4 w-32 rounded" />
<span className="text-xs rounded-full bg-green-100 px-2">Active</span>

// Good
<Alert variant="warning"><AlertDescription>Warning: ...</AlertDescription></Alert>
<Skeleton className="h-4 w-32" />
<Badge>Active</Badge>
```

---

### Icons

`icons-data-icon-attribute` — Icons in `Button` use `data-icon`. Set `data-icon="inline-start"` (before text) or `data-icon="inline-end"` (after text) on the icon element.
```tsx
// Bad
<Button><SearchIcon className="mr-2 size-4" />Search</Button>

// Good
<Button><SearchIcon data-icon="inline-start" />Search</Button>
<Button>Export<DownloadIcon data-icon="inline-end" /></Button>
```

`icons-no-sizing-classes` — No sizing classes (`size-4`, `w-4`, `h-4`) on icons inside components. Components handle icon sizing via CSS.

`icons-as-objects` — Pass icons as component references, not string keys.
```tsx
// Bad
<EmptyState icon="inbox" />

// Good
<EmptyState icon={InboxIcon} />
```

---

## Component Selection

| Need | Use |
|------|-----|
| Button / action | `Button` with appropriate `variant` |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| Toggle between 2–5 options | `ToggleGroup + ToggleGroupItem` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| Overlays | `Dialog` (modal), `Sheet` (side panel), `Drawer` (bottom sheet), `AlertDialog` (confirmation) |
| Feedback | `sonner` (toast), `Alert`, `Progress`, `Skeleton`, `Spinner` |
| Command palette | `Command` inside `Dialog` |
| Charts | `Chart` (wraps Recharts) |
| Layout | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible` |
| Empty states | `Empty` |
| Menus | `DropdownMenu`, `ContextMenu`, `Menubar` |
| Tooltips / info | `Tooltip`, `HoverCard`, `Popover` |

---

## Key Project Context Fields

Run `npx shadcn@latest info --json` and use these fields:

| Field | Purpose |
|-------|---------|
| `aliases` | Use the actual alias prefix for imports (`@/`, `~/`) — never hardcode |
| `isRSC` | When `true`, components using `useState`/`useEffect`/events need `"use client"` |
| `tailwindVersion` | `"v4"` uses `@theme inline` blocks; `"v3"` uses `tailwind.config.js` |
| `tailwindCssFile` | Global CSS file for custom CSS variables — always edit this, never create a new one |
| `style` | Component visual treatment (`nova`, `vega`, etc.) |
| `base` | Primitive library (`radix` or `base`) — affects `asChild` vs `render` API |
| `iconLibrary` | Determines icon imports. `lucide` → `lucide-react`; `tabler` → `@tabler/icons-react`. Never assume `lucide-react` |
| `resolvedPaths` | Exact filesystem destinations for components, utils, hooks |
| `framework` | Routing and file conventions (Next.js App Router, Vite SPA, etc.) |
| `packageManager` | Use for non-shadcn dependency installs (`pnpm add date-fns`) |
| `preset` | Resolved preset code and values for the current project |

---

## Workflow

1. **Get project context** — run `npx shadcn@latest info --json`. Re-run if you need to refresh.
2. **Check installed components** — before running `add`, check the component list or list `resolvedPaths.ui`. Don't import uninstalled components; don't re-add installed ones.
3. **Find components** — `npx shadcn@latest search` (or `npx shadcn@latest search @tailark -q "stats"` for specific registries).
4. **Get docs** — `npx shadcn@latest docs <component>`, then fetch the returned URLs. Use `npx shadcn@latest view` for items not yet installed.
5. **Install or update** — `npx shadcn@latest add`. For existing components, use `--dry-run` and `--diff` first (see below).
6. **Fix third-party imports** — after adding community registry components, check for hardcoded `@/components/ui/...` paths and rewrite with the project's actual alias.
7. **Review added files** — read every added file. Check for missing sub-components, wrong composition, rule violations, and wrong icon library. Fix before moving on.
8. **Never default to a registry** — if the user says "add a login block" without specifying a registry, ask which one to use.

---

## Updating Components

When updating a component from upstream while keeping local changes:

1. `npx shadcn@latest add <component> --dry-run` — see all affected files.
2. For each file: `npx shadcn@latest add <component> --diff <file>` — see upstream vs local diff.
3. Per file decision:
   - No local changes → safe to overwrite.
   - Has local changes → read local file, apply upstream changes, preserve local modifications.
   - User says "just update everything" → use `--overwrite`, but **confirm first**.
4. **Never use `--overwrite` without explicit user approval.**

---

## Presets

```sh
# Inspect current project preset
npx shadcn@latest preset resolve --json

# Decode an incoming preset code
npx shadcn@latest preset decode a2r6bw
npx shadcn@latest preset url a2r6bw
npx shadcn@latest preset open a2r6bw

# Apply preset to existing project
npx shadcn@latest apply a2r6bw              # full apply
npx shadcn@latest apply a2r6bw --only theme  # theme only
npx shadcn@latest apply a2r6bw --only font   # font only
npx shadcn@latest apply a2r6bw --only theme,font
```

Never decode preset codes or build preset URLs manually — always use the CLI commands above.

---

## CLI Quick Reference

```sh
# Initialize new project
npx shadcn@latest init --name my-app --preset base-nova
npx shadcn@latest init --name my-app --preset a2r6bw --template vite
npx shadcn@latest init --defaults    # --template=next --preset=nova

# Monorepo
npx shadcn@latest init --name my-app --preset base-nova --monorepo

# Add components
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add --all

# Preview before adding/updating
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx

# Search registries
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest search @tailark -q "stats"
npx shadcn@latest search @magicui -q "card"

# Get component docs and example URLs
npx shadcn@latest docs button dialog select

# View registry item details (not yet installed)
npx shadcn@latest view @shadcn/button

# Get project context
npx shadcn@latest info --json
```

Named presets: `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`  
Templates: `next`, `vite`, `start`, `react-router`, `astro` (all support `--monorepo`); `laravel` (no monorepo support)  
Preset codes: version-prefixed base62 strings (e.g. `a2r6bw`), from [ui.shadcn.com](https://ui.shadcn.com)
