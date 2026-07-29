function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
        {children}
      </div>
    </section>
  );
}

type CookieType = {
  name: string;
  purpose: string;
  required: boolean;
};

const COOKIE_TYPES: CookieType[] = [
  {
    name: "Essential Cookies",
    purpose:
      "Keep you logged in, remember your session, and make the platform work. These cannot be turned off.",
    required: true,
  },
  {
    name: "Functional Cookies",
    purpose:
      "Remember your preferences like language settings and notification choices.",
    required: false,
  },
  {
    name: "Analytics Cookies",
    purpose:
      "Help us understand how people use the platform so we can improve it. Data is aggregated and anonymous.",
    required: false,
  },
];

export function CookiePolicyContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10 sm:py-12">
      <p className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
        Last updated: July 2026
      </p>

      <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">
        This policy explains what cookies Replace Me uses, why, and how to manage them.
      </p>

      <Section id="1-what-are-cookies" title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help
          websites remember you and your preferences across visits.
        </p>
      </Section>

      <Section id="2-what-we-use" title="Cookies We Use">
        <div className="space-y-4">
          {COOKIE_TYPES.map((type) => (
            <div
              key={type.name}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="shrink-0">
                <span
                  className={[
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                    type.required
                      ? "bg-slate-200 text-slate-700"
                      : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}
                >
                  {type.required ? "Required" : "Optional"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{type.name}</p>
                <p className="text-sm text-slate-600">{type.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="3-manage" title="How to Manage Cookies">
        <p>
          You can control cookies through our cookie banner, which appears the first time you visit the
          site. You can also update your preferences at any time from the footer of any page.
        </p>
        <p>
          You can also manage cookies through your browser settings — most browsers let you block or
          delete cookies. Note that disabling essential cookies may prevent the platform from working
          correctly.
        </p>
      </Section>

      <Section id="4-contact" title="Questions?">
        <p>
          If you have questions about our use of cookies, email us at{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-emerald-700 hover:underline"
          >
            support@replaceme.ph
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
