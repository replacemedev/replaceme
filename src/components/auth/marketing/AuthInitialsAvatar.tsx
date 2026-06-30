export function AuthInitialsAvatar({
  initials,
  variant = "light",
}: {
  initials: string;
  variant?: "light" | "dark";
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-tight ${
        variant === "dark"
          ? "border border-white/20 bg-white/10 text-white shadow-sm"
          : "border-2 border-white/90 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-900/5"
      }`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
