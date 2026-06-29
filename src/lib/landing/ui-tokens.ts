/** Zoom-stable landing section shells — clamp padding, max-width containment. */

export const LANDING_SECTION =
  "relative isolate overflow-clip py-[clamp(3.5rem,7vw,6rem)] px-[clamp(1rem,4vw,var(--spacing-margin-desktop,2rem))]";

export const LANDING_INNER = "mx-auto w-full min-w-0 max-w-container-max";

export const LANDING_SECTION_GRID =
  "pointer-events-none absolute inset-0 bg-grid-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_65%,transparent_100%)]";

export const LANDING_AMBIENT_GLOW =
  "pointer-events-none absolute rounded-full blur-3xl opacity-40 w-[min(28rem,70vw)] h-[min(28rem,70vw)]";
