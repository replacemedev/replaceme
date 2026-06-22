import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "success"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantClasses = ""
    switch (variant) {
      case "default":
        variantClasses = "bg-[#006e2f] text-white hover:bg-[#005321]"
        break
      case "success":
        variantClasses = "bg-[#22c55e] text-white hover:bg-[#16a34a]"
        break
      case "outline":
        variantClasses = "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
        break
      case "ghost":
        variantClasses = "hover:bg-slate-100 hover:text-slate-900"
        break
    }

    let sizeClasses = ""
    switch (size) {
      case "default":
        sizeClasses = "h-12 px-4 py-2"
        break
      case "sm":
        sizeClasses = "h-9 rounded-md px-3"
        break
      case "lg":
        sizeClasses = "h-14 rounded-xl px-8 text-lg"
        break
    }

    const baseClasses = "inline-flex items-center justify-center rounded-xl text-sm font-body-bold font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none w-full"
    
    return (
      <button
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
