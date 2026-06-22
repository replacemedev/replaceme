import Image from "next/image"

export function AuthLayout({
  children,
  sidePanel,
  sidePanelPosition = "right",
  title,
  subtitle,
}: {
  children: React.ReactNode
  sidePanel: React.ReactNode
  sidePanelPosition?: "left" | "right"
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f8fafe]">
      {sidePanelPosition === "left" && (
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#005321] overflow-hidden">
          {sidePanel}
        </div>
      )}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-32">
        <div className="w-full max-w-md mx-auto">
          {/* Logo is typically at the top of the form panel, or welcome texts */}
          {(title || subtitle) && (
            <div className="mb-10">
              {title && <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">{title}</h1>}
              {subtitle && <p className="text-body-base text-slate-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
      {sidePanelPosition === "right" && (
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#ebfdf2] items-center justify-center p-12 overflow-hidden">
          {sidePanel}
        </div>
      )}
    </div>
  )
}
