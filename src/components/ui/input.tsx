import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  /** When false, only border styling reflects errors; message is shown by FormField */
  showErrorMessage?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type,
      icon,
      error,
      showErrorMessage = true,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          aria-invalid={ariaInvalid ?? (hasError ? true : undefined)}
          aria-describedby={ariaDescribedBy}
          className={`flex h-12 w-full rounded-xl border ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-[#22c55e]"
          } bg-white px-4 py-2 text-sm text-slate-800 font-body-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            icon ? "pl-11" : ""
          } ${className}`}
          ref={ref}
          {...props}
        />
        {hasError && showErrorMessage ? (
          <p className="absolute -bottom-5 left-0 mt-1 text-xs text-red-500">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
)
Input.displayName = "Input"

export { Input }
