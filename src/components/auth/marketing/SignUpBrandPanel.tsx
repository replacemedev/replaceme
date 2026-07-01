import { BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { SIGNUP_MARKETING } from "@/lib/auth/static-copy";
import { AuthPanelBackdrop } from "./AuthPanelBackdrop";

const VALUE_ICONS = [ShieldCheck, Users, BadgeCheck] as const;

export function SignUpBrandPanel() {
  const { headline, description, valueProps, trustBadges } =
    SIGNUP_MARKETING;

  return (
    <section
      className="relative flex h-full min-h-[28rem] w-full flex-col justify-center overflow-hidden px-8 py-12 xl:px-14 xl:py-16"
      aria-label="Why Replace Me"
    >
      <AuthPanelBackdrop variant="dark" />

      <div className="relative z-10 mx-auto w-full max-w-lg space-y-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
            Replace Me
          </p>
          <h2 className="text-balance font-display-lg text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            {headline}
          </h2>
          <p className="text-base leading-relaxed text-emerald-50/85">
            {description}
          </p>
        </header>

        <ul className="space-y-5">
          {valueProps.map((item, index) => {
            const Icon = VALUE_ICONS[index] ?? ShieldCheck;
            return (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-emerald-100 transition-colors duration-200 group-hover:bg-white/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="font-body-bold text-sm font-bold text-white">
                    {item.title}
                  </p>
                  <p className="text-sm leading-relaxed text-emerald-100/75">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>


        <ul className="flex flex-wrap gap-2">
          {trustBadges.map((badge) => (
            <li
              key={badge}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-50/90 transition-colors duration-200 hover:bg-white/10"
            >
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
