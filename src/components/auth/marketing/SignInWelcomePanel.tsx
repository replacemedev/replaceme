import { MessageSquare, LayoutDashboard, UserCircle } from "lucide-react";
import { SIGNIN_MARKETING } from "@/lib/auth/static-copy";
import { AuthInitialsAvatar } from "./AuthInitialsAvatar";
import { AuthPanelBackdrop } from "./AuthPanelBackdrop";

const HIGHLIGHT_ICONS = [LayoutDashboard, MessageSquare, UserCircle] as const;

export function SignInWelcomePanel() {
  const { headline, description, highlights, testimonial } = SIGNIN_MARKETING;

  return (
    <section
      className="relative flex h-full min-h-[28rem] w-full flex-col justify-center overflow-hidden px-8 py-12 xl:px-14 xl:py-16"
      aria-label="Platform overview"
    >
      <AuthPanelBackdrop variant="light" />

      <div className="relative z-10 mx-auto w-full max-w-lg space-y-8">
        <article className="rounded-3xl border border-white/70 bg-white/50 p-8 shadow-[0_8px_32px_rgb(16_185_129/0.08),inset_0_1px_0_0_rgb(255_255_255/0.75)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_12px_40px_rgb(16_185_129/0.12)]">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
              Your workspace
            </p>
            <h2 className="text-balance font-display-lg text-2xl font-bold tracking-tight text-slate-900 xl:text-3xl">
              {headline}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </header>

          <ul className="mt-8 space-y-4 border-t border-emerald-900/8 pt-8">
            {highlights.map((item, index) => {
              const Icon = HIGHLIGHT_ICONS[index] ?? LayoutDashboard;
              return (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors duration-200 hover:bg-emerald-100">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <figure className="rounded-2xl border border-emerald-900/8 bg-white/40 px-6 py-5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_6px_24px_rgb(16_185_129/0.06)]">
          <blockquote className="text-sm leading-relaxed text-slate-700">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <AuthInitialsAvatar initials={testimonial.initials} />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {testimonial.name}
              </p>
              <p className="text-xs text-slate-600">{testimonial.role}</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
