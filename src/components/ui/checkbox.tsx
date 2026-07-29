import * as React from "react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Shared checkbox. Visual style (green fill + black check) lives in
 * globals.css `input[type="checkbox"]` so raw checkboxes match too.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={`h-4 w-4 shrink-0 cursor-pointer ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
