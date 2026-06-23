# TypeScript Advanced Types

Comprehensive guidance for mastering TypeScript's advanced type system: generics, conditional types, mapped types, template literal types, utility types, and type-safe patterns.

## When to Use

- Building type-safe libraries or frameworks
- Creating reusable generic components
- Implementing complex type inference logic
- Designing type-safe API clients
- Building form validation systems
- Creating strongly-typed configuration objects
- Implementing type-safe state management
- Migrating JavaScript codebases to TypeScript

---

## Core Concepts

### 1. Generics

Create reusable, type-flexible components while maintaining type safety.

```ts
// Basic generic function
function identity<T>(value: T): T {
  return value
}

const num = identity(42)      // inferred: number
const str = identity("hello") // inferred: string
```

**Constraints:**
```ts
interface HasLength { length: number }

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length)
  return item
}

logLength("hello")     // OK: string has length
logLength([1, 2, 3])   // OK: array has length
// logLength(42)        // Error: number has no length
```

**Multiple type parameters:**
```ts
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 }
}

const merged = merge({ name: "John" }, { age: 30 })
// Type: { name: string } & { age: number }
```

---

### 2. Conditional Types

Create types that depend on conditions, enabling sophisticated type logic.

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false
```

**Extracting types with `infer`:**
```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type ElementType<T> = T extends (infer U)[] ? U : never
type PromiseType<T> = T extends Promise<infer U> ? U : never

function getUser() { return { id: 1, name: "John" } }
type User = ReturnType<typeof getUser>  // { id: number; name: string }
```

**Distributive conditional types:**
```ts
// Distributes over unions: string[] | number[]
type ToArray<T> = T extends any ? T[] : never
type Result = ToArray<string | number>  // string[] | number[]
```

**Nested conditions:**
```ts
type TypeName<T> =
  T extends string   ? "string"   :
  T extends number   ? "number"   :
  T extends boolean  ? "boolean"  :
  T extends Function ? "function" :
  "object"

type T1 = TypeName<string>     // "string"
type T2 = TypeName<() => void> // "function"
```

---

### 3. Mapped Types

Transform existing types by iterating over their properties.

```ts
// Core modifiers
type Readonly<T>  = { readonly [P in keyof T]: T[P] }
type Partial<T>   = { [P in keyof T]?: T[P] }
type Required<T>  = { [P in keyof T]-?: T[P] }   // -? removes optional
type Mutable<T>   = { -readonly [P in keyof T]: T[P] }
```

**Key remapping:**
```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }
```

**Filtering properties by type:**
```ts
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Mixed { id: number; name: string; age: number; active: boolean }
type OnlyNumbers = PickByType<Mixed, number>
// { id: number; age: number }
```

---

### 4. Template Literal Types

Create string-based types with pattern matching and transformation.

```ts
type EventName = "click" | "focus" | "blur"
type EventHandler = `on${Capitalize<EventName>}`
// "onClick" | "onFocus" | "onBlur"
```

**String manipulation built-ins:**
```ts
type Upper = Uppercase<"hello">      // "HELLO"
type Lower = Lowercase<"HELLO">      // "hello"
type Cap   = Capitalize<"john">      // "John"
type Uncap = Uncapitalize<"John">    // "john"
```

**Dot-path types:**
```ts
type Path<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${Path<T[K]>}` : never }[keyof T]
  : never

interface Config { server: { host: string; port: number }; db: { url: string } }
type ConfigPath = Path<Config>
// "server" | "db" | "server.host" | "server.port" | "db.url"
```

---

### 5. Utility Types

```ts
type PartialUser          = Partial<User>             // all optional
type RequiredUser         = Required<PartialUser>     // all required
type ReadonlyUser         = Readonly<User>            // all readonly
type UserName             = Pick<User, "name">        // select fields
type UserWithoutPassword  = Omit<User, "password">    // exclude fields
type T1                   = Exclude<"a"|"b"|"c", "a"> // "b" | "c"
type T2                   = Extract<"a"|"b"|"c", "a"|"b"> // "a" | "b"
type T3                   = NonNullable<string|null|undefined> // string
type PageInfo             = Record<"home"|"about", { title: string }>
type FetchReturn          = ReturnType<typeof fetch>
type FetchParams          = Parameters<typeof fetch>
type ResolvedFetch        = Awaited<ReturnType<typeof fetch>>
```

---

## Advanced Patterns

### Pattern 1: Type-Safe Event Emitter

```ts
type EventMap = {
  "user:created": { id: string; name: string }
  "user:updated": { id: string }
  "user:deleted": { id: string }
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {}

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event]!.push(callback)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach(cb => cb(data))
  }
}

const emitter = new TypedEventEmitter<EventMap>()

emitter.on("user:created", data => {
  console.log(data.id, data.name)  // type-safe
})
// emitter.emit("user:created", { id: "1" })  // Error: missing 'name'
```

### Pattern 2: Type-Safe API Client

```ts
type EndpointConfig = {
  "/users": {
    GET: { response: User[] }
    POST: { body: { name: string; email: string }; response: User }
  }
  "/users/:id": {
    GET: { params: { id: string }; response: User }
    DELETE: { params: { id: string }; response: void }
  }
}

type ExtractResponse<T> = T extends { response: infer R } ? R : never

// Usage: types inferred from path + method
// const users = await api.request("/users", "GET")         // User[]
// const user  = await api.request("/users/:id", "GET", ...) // User
```

### Pattern 3: Deep Readonly / Deep Partial

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function ? T[P] : DeepReadonly<T[P]>
    : T[P]
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U> ? Array<DeepPartial<U>> : DeepPartial<T[P]>
    : T[P]
}
```

### Pattern 4: Type-Safe Form Validation

```ts
type ValidationRule<T> = { validate: (value: T) => boolean; message: string }
type FieldValidation<T> = { [K in keyof T]?: ValidationRule<T[K]>[] }
type ValidationErrors<T> = { [K in keyof T]?: string[] }

class FormValidator<T extends Record<string, any>> {
  constructor(private rules: FieldValidation<T>) {}

  validate(data: T): ValidationErrors<T> | null {
    const errors: ValidationErrors<T> = {}
    let hasErrors = false

    for (const key in this.rules) {
      const fieldErrors = this.rules[key]!
        .filter(rule => !rule.validate(data[key]))
        .map(rule => rule.message)

      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors
        hasErrors = true
      }
    }

    return hasErrors ? errors : null
  }
}
```

### Pattern 5: Discriminated Unions

```ts
type AsyncState<T> =
  | { status: "loading" }
  | { status: "error";   error: string }
  | { status: "success"; data: T }

function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x)
}

function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "loading":  return "Loading..."
    case "error":    return state.error    // narrowed: string
    case "success":  return String(state.data)  // narrowed: T
    default:         return assertNever(state)  // exhaustive
  }
}
```

---

## Type Inference Techniques

### `infer` Keyword

```ts
type ElementType<T> = T extends (infer U)[] ? U : never
type PromiseType<T> = T extends Promise<infer U> ? U : never
type Parameters<T>  = T extends (...args: infer P) => any ? P : never

function foo(a: string, b: number): boolean { return true }
type FooParams  = Parameters<typeof foo>   // [string, number]
type FooReturn  = ReturnType<typeof foo>   // boolean
```

### Type Guards

```ts
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isArrayOf<T>(value: unknown, guard: (x: unknown) => x is T): value is T[] {
  return Array.isArray(value) && value.every(guard)
}

const data: unknown = ["a", "b", "c"]
if (isArrayOf(data, isString)) {
  data.forEach(s => s.toUpperCase())  // s: string
}
```

### Assertion Functions

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("Not a string")
}

function process(value: unknown) {
  assertIsString(value)
  console.log(value.toUpperCase())  // value: string
}
```

### `as const` Assertions

```ts
const roles = ["admin", "user", "guest"] as const
type Role = typeof roles[number]  // "admin" | "user" | "guest"

const config = { host: "localhost", port: 3000 } as const
// Type: { readonly host: "localhost"; readonly port: 3000 }
```

---

## Best Practices

| Practice | Guidance |
|---------|---------|
| `unknown` over `any` | `unknown` requires narrowing; `any` disables all checking |
| `interface` for objects | Better error messages; supports declaration merging |
| `type` for unions/mapped | More flexible for complex transformations |
| Prefer inference | Only specify type args when inference fails |
| Avoid `as T` casts | Use type guards — casts are silently wrong |
| Enable `"strict": true` | Required for full type safety |
| Cache complex types | Name intermediate types to help the compiler |
| Limit recursion depth | Deep recursive types slow compilation |
| Write type tests | Verify types with `AssertEqual` at compile time |

---

## Type Testing

```ts
type AssertEqual<T, U> = [T] extends [U]
  ? [U] extends [T] ? true : false
  : false

// Compile-time tests
type Test1 = AssertEqual<string, string>           // true
type Test2 = AssertEqual<string, number>           // false
type Test3 = AssertEqual<string | number, string>  // false

// Verify utility types
type Test4 = AssertEqual<Partial<{ a: string }>, { a?: string }>  // true
```

---

## Common Pitfalls

- **Over-using `any`** — defeats TypeScript; use `unknown` + narrowing
- **Ignoring strict null checks** — leads to runtime `null` / `undefined` errors
- **Too-complex types** — slow compilation; simplify or break into named types
- **Not using discriminated unions** — misses narrowing opportunities
- **Forgetting `readonly`** — allows unintended mutations
- **Circular type references** — can cause compiler errors; restructure
- **Not handling edge cases** — empty arrays, `null`, `undefined` in generics
