import Image from "next/image";

const MESH_GRADIENT = [
  "radial-gradient(ellipse 80% 60% at 15% 20%, rgb(167 243 208 / 0.55), transparent 55%)",
  "radial-gradient(ellipse 70% 50% at 85% 15%, rgb(204 251 241 / 0.45), transparent 50%)",
  "radial-gradient(ellipse 75% 55% at 70% 85%, rgb(153 246 228 / 0.35), transparent 52%)",
  "radial-gradient(ellipse 60% 45% at 10% 75%, rgb(241 245 249 / 0.65), transparent 48%)",
  "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 42%, #e2f7ed 100%)",
].join(", ");

const GRID_TEXTURE = [
  "linear-gradient(rgb(5 150 105 / 0.06) 1px, transparent 1px)",
  "linear-gradient(90deg, rgb(5 150 105 / 0.06) 1px, transparent 1px)",
].join(", ");

function DecorativeQuote() {
  return (
    <span
      className="pointer-events-none absolute -left-1 -top-6 select-none font-serif text-[5.5rem] leading-none text-emerald-600/15 lg:-left-2 lg:-top-8 lg:text-[7rem]"
      aria-hidden
    >
      &ldquo;
    </span>
  );
}

export function LoginTestimonial({
  quote = "",
  name = "",
  role = "",
  compact = false,
}: {
  quote?: string;
  name?: string;
  role?: string;
  compact?: boolean;
}) {
  if (!quote?.trim()) return null;

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-center overflow-hidden ${
        compact ? "px-0 py-0" : "px-8 py-12 md:px-16 lg:px-20 xl:px-24"
      }`}
    >
      {/* Mesh gradient base */}
      <div
        className="pointer-events-none absolute inset-0 -z-30"
        style={{ backgroundImage: MESH_GRADIENT }}
        aria-hidden
      />

      {/* Faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: GRID_TEXTURE,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* Dot-matrix accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-[15] opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgb(16 185 129) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />

      {/* Ambient light orbs */}
      <div
        className="pointer-events-none absolute -right-20 top-12 -z-10 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-16 -z-10 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl"
        aria-hidden
      />

      <article className="relative z-10 mx-auto w-full max-w-xl">
        <div
          className={`relative rounded-3xl border border-white/70 bg-white/45 shadow-[0_8px_32px_rgb(16_185_129/0.08),inset_0_1px_0_0_rgb(255_255_255/0.75)] backdrop-blur-md ${
            compact ? "p-5 sm:p-6" : "p-8 md:p-10 lg:p-12"
          }`}
        >
          {!compact ? <DecorativeQuote /> : null}

          <blockquote
            className={`relative text-balance font-semibold tracking-tight text-slate-900 ${
              compact
                ? "text-base leading-relaxed"
                : "text-2xl leading-[1.35] md:text-[1.75rem] lg:text-3xl lg:leading-[1.3]"
            }`}
          >
            {quote}
          </blockquote>

          <footer className="mt-8 flex items-center gap-4 border-t border-emerald-900/8 pt-8">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/90 shadow-sm ring-1 ring-emerald-900/5">
              <Image
                src="/images/sarah-jenkins.png"
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <cite className="not-italic">
              <p className="font-body-bold text-base font-bold text-slate-900">
                {name}
              </p>
              <p className="text-sm font-body-base text-slate-600">{role}</p>
            </cite>
          </footer>
        </div>
      </article>
    </div>
  );
}
