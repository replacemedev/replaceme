---
description: shadcn/ui critical rules for styling, forms, composition, icons, and CLI workflow.
alwaysApply: true
---

## shadcn/ui

Enforce rules in priority order: Styling → Forms → Composition → Icons → CLI Workflow.

**HIGH — Styling:** `className` for layout only — never override component colors. No `space-y-*`/`space-x-*`; use `flex flex-col gap-*`. `size-*` for equal dimensions. `truncate` shorthand. Semantic tokens only (`bg-background`, `text-muted-foreground`). `cn()` for conditional classes. No manual z-index on overlays.

**HIGH — Forms:** `FieldGroup + Field` for all form layout. `InputGroup` requires `InputGroupInput`/`InputGroupTextarea`. Buttons in inputs via `InputGroupAddon`. 2–7 option sets → `ToggleGroup`. Grouped checkboxes/radios → `FieldSet + FieldLegend`. Validation: `data-invalid` on `Field`, `aria-invalid` on control.

**HIGH — Composition:** Items inside their Group (`SelectItem` → `SelectGroup`, `CommandItem` → `CommandGroup`). `asChild`/`render` for custom triggers. Dialog/Sheet/Drawer need a Title (`sr-only` if hidden). Full Card: Header/Title/Description/Content/Footer. `Button` has no loading prop — compose with `Spinner + data-icon + disabled`. `Avatar` always needs `AvatarFallback`. Use `Alert`, `Empty`, `sonner`, `Skeleton`, `Badge`, `Separator` instead of custom divs.

**MEDIUM — Icons:** `data-icon="inline-start"/"inline-end"` on icons inside `Button`. No sizing classes on icons inside components. Icons as objects (`icon={CheckIcon}`), not strings.

**MEDIUM — CLI:** `npx shadcn@latest info --json` first. Fetch docs via `npx shadcn@latest docs <component>` before implementing. `--dry-run` + `--diff` before updates. Never `--overwrite` without approval. Ask which registry when unspecified.

### Quick Reference

| Rule | Pattern |
|------|---------|
| `styling-no-space-utilities` | `flex flex-col gap-4` not `space-y-4` |
| `styling-size-shorthand` | `size-10` not `w-10 h-10` |
| `styling-semantic-colors` | `bg-background` not `bg-white dark:bg-gray-900` |
| `forms-field-group` | `<FieldGroup><Field>` not `<div className="space-y-4">` |
| `forms-validation-attributes` | `data-invalid` on `Field`, `aria-invalid` on control |
| `forms-toggle-group` | `ToggleGroup` for 2–7 option sets |
| `composition-items-in-groups` | `SelectItem` inside `SelectGroup` |
| `composition-overlay-title` | `DialogTitle` always required |
| `composition-button-loading` | `Spinner + data-icon + disabled` not `isLoading` prop |
| `icons-data-icon-attribute` | `<SearchIcon data-icon="inline-start" />` not `className="mr-2 size-4"` |
