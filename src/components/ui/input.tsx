import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`flex h-12 w-full rounded-xl border ${
            error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-[#22c55e]"
          } bg-white px-4 py-2 text-sm text-slate-800 font-body-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            icon ? "pl-11" : ""
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
