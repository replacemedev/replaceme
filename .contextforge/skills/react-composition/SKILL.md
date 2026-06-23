# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals. These patterns make codebases easier for both humans and AI agents to work with as they scale.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture decisions
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Component Architecture | HIGH | `architecture-` |
| 2 | State Management | MEDIUM | `state-` |
| 3 | Implementation Patterns | MEDIUM | `patterns-` |
| 4 | React 19 APIs | MEDIUM | `react19-` |

---

## Priority 1: Component Architecture (HIGH)

### `architecture-avoid-boolean-props`

**Don't add boolean props to customize component behavior — use composition instead.**

Boolean props seem convenient but accumulate into a cartesian product of mutually exclusive states. With four boolean props you have 16 possible configurations, most of which are either invalid or untested. Composition makes each configuration explicit and independently typed.

```tsx
// Bad — impossible to know which combinations are valid
interface SelectProps {
  isMulti?: boolean
  isSearchable?: boolean
  isGrouped?: boolean
  isDisabled?: boolean
  isLoading?: boolean
}
<Select isMulti isSearchable isGrouped />

// Good — compose capabilities; invalid combinations don't compile
<Select>
  <Select.Search placeholder="Search..." />
  <Select.Options>
    <Select.Group label="Fruits">
      <Select.Option value="apple">Apple</Select.Option>
      <Select.Option value="banana">Banana</Select.Option>
    </Select.Group>
    <Select.Option value="other">Other</Select.Option>
  </Select.Options>
</Select>
```

**Identifying the smell:** If a component has more than two boolean props, or if boolean props are mutually exclusive, reach for composition.

---

### `architecture-compound-components`

**Structure complex components as a family that shares state through context.**

The root component owns state. Named sub-components (attached as properties) consume that state via context. This removes prop drilling and allows consumers to arrange sub-components freely.

```tsx
// Complete compound component implementation
const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select sub-components must be used inside <Select>')
  return ctx
}

function Select({ children, defaultValue, onChange }: SelectProps) {
  const [value, setValue] = useState(defaultValue ?? '')

  const handleChange = (newValue: string) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <SelectContext.Provider value={{ value, onChange: handleChange }}>
      <div role="listbox" className="select">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

Select.Option = function SelectOption({ value, children }: OptionProps) {
  const { value: selected, onChange } = useSelectContext()
  return (
    <div
      role="option"
      aria-selected={selected === value}
      onClick={() => onChange(value)}
      className={selected === value ? 'option selected' : 'option'}
    >
      {children}
    </div>
  )
}

Select.Group = function SelectGroup({ label, children }: GroupProps) {
  return (
    <div role="group" aria-label={label}>
      <div className="group-label">{label}</div>
      {children}
    </div>
  )
}

Select.Search = function SelectSearch({ placeholder }: SearchProps) {
  const [query, setQuery] = useState('')
  // Search logic here
  return <input type="search" placeholder={placeholder} value={query} onChange={e => setQuery(e.target.value)} />
}
```

**When to use compound components:** Whenever multiple sub-components need to coordinate state (tabs/tab panels, accordion/accordion items, dropdown/dropdown items).

---

## Priority 2: State Management (MEDIUM)

### `state-decouple-implementation`

**The provider is the only place that knows how state is managed. Consumers receive a stable interface.**

Never expose raw state setters (`setIsOpen`, `setCount`) through context or return values. Wrap them in named actions that describe intent. This allows you to change the state implementation (e.g., switch from `useState` to `useReducer`) without touching consumers.

```tsx
// Bad — consumer depends on useState internals
function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}
// Consumer: ctx.setIsOpen(true) — breaks if you switch to useReducer

// Good — consumer sees stable named actions
function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const actions = useMemo(() => ({
    open:  () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }), [])

  return (
    <DialogContext.Provider value={{ state: { isOpen }, actions }}>
      {children}
    </DialogContext.Provider>
  )
}
// Consumer: ctx.actions.open() — stable regardless of implementation
```

---

### `state-context-interface`

**Define a generic `ContextInterface<TState, TActions, TMeta>` shape for all context values.**

A consistent interface across all context providers makes your system predictable, enables dependency injection in tests, and documents which parts of the value are state, which are actions, and which are metadata.

```tsx
// Generic interface — define once, use everywhere
interface ContextInterface<TState, TActions, TMeta = void> {
  state: TState
  actions: TActions
  meta?: TMeta
}

// Dialog context
interface DialogState   { isOpen: boolean; title: string }
interface DialogActions { open(title: string): void; close(): void }
type DialogContextValue = ContextInterface<DialogState, DialogActions>

// Cart context
interface CartState   { items: CartItem[]; total: number }
interface CartActions { addItem(item: CartItem): void; removeItem(id: string): void; clear(): void }
type CartContextValue = ContextInterface<CartState, CartActions>

// In tests — inject a mock that satisfies the interface
const mockDialog: DialogContextValue = {
  state: { isOpen: true, title: 'Confirm' },
  actions: { open: jest.fn(), close: jest.fn() }
}
```

---

### `state-lift-state`

**Move shared state up to a provider component when siblings need to coordinate.**

If two sibling components need to read or write the same state, lift that state to their nearest common ancestor. Never duplicate state in siblings — they will go out of sync.

```tsx
// Bad — TabList and TabPanels maintain separate activeTab state
function Tabs() {
  return (
    <div>
      <TabList />    {/* useState(0) internally */}
      <TabPanels />  {/* useState(0) internally — diverges! */}
    </div>
  )
}

// Good — Tabs owns the shared state
const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({ children, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  return (
    <TabsContext.Provider value={{ state: { activeIndex }, actions: { setActiveIndex } }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: React.ReactNode }) {
  const { state, actions } = useContext(TabsContext)!
  return (
    <div role="tablist">
      {React.Children.map(children, (child, i) =>
        React.cloneElement(child as React.ReactElement, {
          isActive: i === state.activeIndex,
          onClick: () => actions.setActiveIndex(i)
        })
      )}
    </div>
  )
}
```

---

## Priority 3: Implementation Patterns (MEDIUM)

### `patterns-explicit-variants`

**Create separate named components for each variant instead of adding boolean mode props.**

Variants are independently typed, tested, documented, and extended. You can add props relevant to a specific variant without polluting the base type with optional fields that only apply in one mode.

```tsx
// Bad — unclear which props apply to which mode
interface ButtonProps {
  isPrimary?: boolean
  isSecondary?: boolean
  isGhost?: boolean
  isDestructive?: boolean
  isLoading?: boolean  // only makes sense for primary?
  href?: string        // only makes sense for link variant?
}

// Good option A — separate named components
function PrimaryButton({ onClick, isLoading, children }: PrimaryButtonProps) { ... }
function SecondaryButton({ onClick, children }: SecondaryButtonProps) { ... }
function GhostButton({ onClick, children }: GhostButtonProps) { ... }
function LinkButton({ href, children }: LinkButtonProps) { ... }    // has href, not onClick

// Good option B — discriminated union (single component, exhaustive variants)
type ButtonProps =
  | { variant: 'primary';   onClick: () => void; isLoading?: boolean; children: React.ReactNode }
  | { variant: 'secondary'; onClick: () => void; children: React.ReactNode }
  | { variant: 'link';      href: string;        children: React.ReactNode }

function Button(props: ButtonProps) {
  switch (props.variant) {
    case 'primary':   return <button onClick={props.onClick} disabled={props.isLoading}>{props.children}</button>
    case 'secondary': return <button onClick={props.onClick}>{props.children}</button>
    case 'link':      return <a href={props.href}>{props.children}</a>
  }
}
```

---

### `patterns-children-over-render-props`

**Use `children` or named sub-component slots for composition instead of `renderX` callback props.**

Render props (`renderHeader`, `renderFooter`) are harder to compose, harder to type, and harder to read. Sub-component slots are declarative and tree-friendly.

```tsx
// Bad — render prop callbacks are imperative and hard to compose
<Card
  renderHeader={() => <h2>Title</h2>}
  renderBody={() => <p>Content</p>}
  renderFooter={() => <><button>OK</button><button>Cancel</button></>}
/>

// Good — sub-component slots
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <button>OK</button>
    <button>Cancel</button>
  </Card.Footer>
</Card>

// Implementation — collect named slots from children
function Card({ children }: { children: React.ReactNode }) {
  const header = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === Card.Header
  )
  const body = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === Card.Body
  )
  // ... render layout
}
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

---

## Priority 4: React 19 APIs (MEDIUM)

> **React 19+ only.** Skip this section entirely if your project uses React 18 or earlier.

### `react19-no-forwardref`

**Don't use `forwardRef` in React 19 — `ref` is a plain prop.**

React 19 made `ref` a first-class prop. `forwardRef` still works for backwards compatibility but is no longer needed for new components.

```tsx
// React 18 — forwardRef required to pass ref to DOM elements
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return <input {...props} ref={ref} />
})

// React 19 — ref is just a prop
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>
}

function Input({ ref, ...props }: InputProps) {
  return <input {...props} ref={ref} />
}

// Compound components also simplified
function Select({ ref, children, ...props }: SelectProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props}>{children}</div>
}
```

---

### `react19-use-hook`

**Use `use(Context)` instead of `useContext()` in React 19 — it can be called conditionally.**

`useContext()` must follow the Rules of Hooks — unconditional, at top level. `use()` removes this restriction: it can appear after early returns, inside `if` statements, and inside loops.

```tsx
// React 18 — useContext must be at top level
function ThemeButton({ variant }: { variant: 'primary' | 'ghost' }) {
  const theme = useContext(ThemeContext)  // must be here, before any conditionals
  if (variant === 'ghost') return <button style={{ color: 'inherit' }}>Ghost</button>
  return <button style={{ background: theme.primary }}>Primary</button>
}

// React 19 — use() can come after the early return
function ThemeButton({ variant }: { variant: 'primary' | 'ghost' }) {
  if (variant === 'ghost') return <button style={{ color: 'inherit' }}>Ghost</button>
  const theme = use(ThemeContext)  // only reached for non-ghost variant
  return <button style={{ background: theme.primary }}>Primary</button>
}

// use() also works with Promises (Suspense integration)
function UserCard({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)  // suspends until resolved
  return <div>{user.name}</div>
}
```

**Note:** `use()` still requires a context or promise argument — it does not replace all hook patterns.
