interface LegalPageLayoutProps {
  badge: string;
  badgeVariant?: "text" | "pill";
  title: string;
  lastUpdated: string;
  children?: React.ReactNode;
  wide?: boolean;
}

export function LegalPageLayout({
  badge,
  badgeVariant = "text",
  title,
  lastUpdated,
  children,
  wide = false,
}: LegalPageLayoutProps) {
  return (
    <main className="pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1">
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <header className="text-center mb-10 sm:mb-12">
          {badgeVariant === "pill" ? (
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider mb-4">
              {badge}
            </span>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-3">
              {badge}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last Updated: {lastUpdated}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
