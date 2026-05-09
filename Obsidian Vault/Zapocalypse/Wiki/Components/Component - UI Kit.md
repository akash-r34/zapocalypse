---
type: entity
entity_kind: component
domain: ui
source_file: src/components/ui/
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
related:
  - "[[Wiki/Concepts/Glass Morphism Theme]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - UI Kit

> Primitive reusable components used across the app. All styled via `--glass-*` CSS variables.

## Components

### `Button`
```typescript
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "filled" | "tonal" | "outlined" | "text";
  loading?: boolean;
}
// ForwardRef. Loading spinner replaces children.
```

### `Card`
```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  style?: CSSProperties;
}
// Applies "glass" or "glass-elevated" class.
```

### `Chip`
```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}
// Pill button with selected state highlight.
```

### `TextField`
```typescript
type TextFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
} & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>)
// ForwardRef. Conditional <input> or <textarea>.
```

### `ProgressIndicator`
```typescript
interface ProgressIndicatorProps { status: PipelineStatus }
// Linear bar with 5 numbered steps. Error state → red fill.
```

### `OverflowMenu`
```typescript
interface OverflowMenuProps { children: ReactNode }
// "..." menu button that reveals a dropdown of child actions.
```

### `ErrorBoundary`
```typescript
// Class component wrapping React error boundary.
```

## Cross-References

- Design system: [[Wiki/Concepts/Glass Morphism Theme]]
- Used throughout: all output and pipeline components
