import Image from "next/image"

export function AuthLayout({
  children,
  sidePanel,
  sidePanelPosition = "right",
  title,
  subtitle,
  footer,
}: {
  children: React.ReactNode
  sidePanel: React.ReactNode
  sidePanelPosition?: "left" | "right"
  title?: string
  subtitle?: string
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f8fafe]">
      {sidePanelPosition === "left" && (
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#005321] overflow-hidden">
          {sidePanel}
        </div>
      )}
      <div className="flex w-full lg:w-1/2 flex-col justify-between min-h-screen px-6 py-8 sm:px-12 lg:px-20 xl:px-32">
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto py-8">
          {/* Logo is typically at the top of the form panel, or welcome texts */}
          {(title || subtitle) && (
            <div className="mb-10">
              {title && <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">{title}</h1>}
              {subtitle && <p className="text-body-base text-slate-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
        {footer}
      </div>
      {sidePanelPosition === "right" && (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 items-center justify-center p-12">
          {sidePanel}
        </div>
      )}
    </div>
  )
}

