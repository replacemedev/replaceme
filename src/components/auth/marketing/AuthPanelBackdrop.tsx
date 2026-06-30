type AuthPanelBackdropVariant = "dark" | "light";

const LIGHT_MESH = [
  "radial-gradient(ellipse 80% 60% at 15% 20%, rgb(167 243 208 / 0.55), transparent 55%)",
  "radial-gradient(ellipse 70% 50% at 85% 15%, rgb(204 251 241 / 0.45), transparent 50%)",
  "radial-gradient(ellipse 75% 55% at 70% 85%, rgb(153 246 228 / 0.35), transparent 52%)",
  "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 42%, #e2f7ed 100%)",
].join(", ");

const DARK_MESH = [
  "radial-gradient(ellipse 70% 55% at 20% 25%, rgb(0 110 47 / 0.45), transparent 55%)",
  "radial-gradient(ellipse 60% 50% at 85% 20%, rgb(15 118 110 / 0.35), transparent 50%)",
  "radial-gradient(ellipse 65% 45% at 60% 90%, rgb(0 83 33 / 0.5), transparent 52%)",
  "linear-gradient(145deg, #005321 0%, #0f3d2a 38%, #0f172a 100%)",
].join(", ");

const GRID_LIGHT = [
  "linear-gradient(rgb(5 150 105 / 0.06) 1px, transparent 1px)",
  "linear-gradient(90deg, rgb(5 150 105 / 0.06) 1px, transparent 1px)",
].join(", ");

const GRID_DARK = [
  "linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px)",
  "linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
].join(", ");

export function AuthPanelBackdrop({
  variant = "light",
}: {
  variant?: AuthPanelBackdropVariant;
}) {
  const isDark = variant === "dark";

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-30"
        style={{ backgroundImage: isDark ? DARK_MESH : LIGHT_MESH }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: isDark ? GRID_DARK : GRID_LIGHT,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${
          isDark
            ? "right-[-5rem] top-16 h-80 w-80 bg-emerald-400/20"
            : "right-[-5rem] top-12 h-80 w-80 bg-emerald-200/30"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${
          isDark
            ? "bottom-12 left-[-4rem] h-72 w-72 bg-teal-500/15"
            : "bottom-16 left-[-4rem] h-72 w-72 bg-teal-200/25"
        }`}
        aria-hidden
      />
    </>
  );
}
