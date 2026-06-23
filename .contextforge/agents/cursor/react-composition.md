---
description: React composition patterns — compound components, context state interfaces, explicit variants, and React 19 APIs.
alwaysApply: true
---

## React Composition Patterns

Evaluate composition in priority order: Component Architecture (HIGH) → State Management → Implementation Patterns → React 19 APIs.

**HIGH — Component Architecture:** Boolean props (`isMulti`, `isSearchable`, `isGrouped`) accumulate into a cartesian explosion of untested states — replace with composition. Use compound components: root owns state via context, named sub-components (`Select.Option`, `Modal.Header`) consume it without prop drilling.

**MEDIUM — State Management:** The provider is the only place that knows how state is managed — consumers receive `{ state, actions }`, never raw setters. Define context with `ContextInterface<TState, TActions, TMeta>` for a stable, injectable interface. Lift shared state to the nearest common provider; never duplicate across siblings.

**MEDIUM — Implementation Patterns:** Prefer explicit named variant components (`PrimaryButton`) or discriminated union `variant` prop over boolean mode props. Use sub-component slots (`Modal.Header`, `Modal.Footer`) or `children` instead of `renderX` callback props.

**MEDIUM — React 19 (skip for React 18):** Drop `forwardRef` — `ref` is a plain prop in React 19. Use `use(Context)` instead of `useContext()` — it works after early returns and inside conditionals.

### Quick Reference

| Rule | Pattern |
|------|---------|
| `architecture-avoid-boolean-props` | Replace `<Select isMulti isSearchable>` with `<Select><Select.Search/></Select>` |
| `architecture-compound-components` | Root owns context; `Select.Option`, `Modal.Header` consume it |
| `state-decouple-implementation` | Expose `{ open(), close() }` not raw `setIsOpen` |
| `state-context-interface` | `ContextInterface<TState, TActions, TMeta>` shape |
| `state-lift-state` | Common parent owns state shared by siblings |
| `patterns-explicit-variants` | `PrimaryButton` / `SecondaryButton` not `<Button isPrimary>` |
| `patterns-children-over-render-props` | `<Modal.Header>` not `renderHeader={() => ...}` |
| `react19-no-forwardref` | `function Input({ ref, ...props })` not `forwardRef(...)` |
| `react19-use-hook` | `use(ThemeContext)` works after early returns |
