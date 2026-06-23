---
description: TypeScript advanced type system guidance for generics, conditional types, mapped types, template literals, discriminated unions, and type-safe patterns.
alwaysApply: false
---

## TypeScript Advanced Types

Apply when building type-safe libraries, generic components, complex inference, API clients, form validation, or state management systems.

**Generics (HIGH):** Constrain type params with `extends`. Use multiple params for merge/transform operations. Let TypeScript infer — only specify explicitly when inference fails.

**Conditional Types (HIGH):** `T extends Condition ? True : False`. Use `infer` to extract sub-types (return types, element types, promise types). Distributive over unions — use `[T]` to suppress distribution. Nest for type-to-string mappings.

**Mapped Types (HIGH):** Iterate `keyof T` to transform properties. Use `readonly`/`?`/`-?`/`-readonly` modifiers. Remap keys with `as` + template literals (`get${Capitalize<K>}`). Filter properties with `as K extends U ? K : never`. `DeepReadonly`/`DeepPartial` via recursive mapped + conditional types.

**Discriminated Unions (HIGH):** Shared literal `type`/`status` field enables narrowing in switch/if. Use `assertNever(x: never)` in default branch for exhaustive checks. Prefer over boolean flags — boolean flags allow impossible states.

**Type Inference (HIGH):** `infer` captures sub-types in conditional types. Type guards (`value is T`) for runtime narrowing. Assertion functions (`asserts value is T`) for imperative checks. `as const` preserves literal types and makes arrays into union literals.

**Template Literal Types (MEDIUM):** Derive event handler names from event unions. Build dot-path types for nested objects. `Uppercase`/`Lowercase`/`Capitalize`/`Uncapitalize` built-ins.

**Best Practices:** `unknown` over `any`. `interface` for object shapes, `type` for unions/mapped types. Avoid `as SomeType` — use type guards. Enable `"strict": true`. Avoid deeply nested conditional types (slow compilation). Write compile-time type tests with `AssertEqual`.
