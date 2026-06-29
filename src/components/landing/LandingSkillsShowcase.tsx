import {
  LANDING_SKILL_CATEGORIES,
  LANDING_SKILL_MARQUEE_ROW,
} from "@/config/landingSkills";
import {
  LANDING_AMBIENT_GLOW,
  LANDING_INNER,
  LANDING_SECTION,
  LANDING_SECTION_GRID,
} from "@/lib/landing/ui-tokens";

function MarqueeRow({
  reverse = false,
}: {
  reverse?: boolean;
}) {
  const items = reverse
    ? [...LANDING_SKILL_MARQUEE_ROW].reverse()
    : LANDING_SKILL_MARQUEE_ROW;

  return (
    <div
      className={`landing-skills-marquee-track ${reverse ? "landing-skills-marquee-reverse" : ""}`}
      aria-hidden={reverse}
    >
      {[...items, ...items].map((item, index) => (
        <span
          key={`${item.skill}-${index}`}
          className="landing-skill-chip shrink-0"
        >
          <span className="text-[10px] font-label-mono uppercase tracking-wider text-emerald-600/80">
            {item.category}
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {item.skill}
          </span>
        </span>
      ))}
    </div>
  );
}

export function LandingSkillsShowcase() {
  return (
    <section
      className={`${LANDING_SECTION} bg-gradient-to-b from-white via-[#f8fafc] to-white`}
      id="skills"
      aria-labelledby="landing-skills-heading"
    >
      <div className={LANDING_SECTION_GRID} aria-hidden />
      <div
        className={`${LANDING_AMBIENT_GLOW} -top-[10%] right-[5%] bg-emerald-200/50`}
        aria-hidden
      />

      <div className={`${LANDING_INNER} relative z-10 space-y-10`}>
        <div className="text-center max-w-2xl mx-auto reveal-item space-y-4">
          <p className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-label-mono text-[10px] uppercase tracking-widest">
            Depth of talent
          </p>
          <h2
            id="landing-skills-heading"
            className="text-display-lg text-slate-900 font-bold tracking-tight text-balance"
          >
            Hire across <span className="text-[#22c55e]">high-demand</span>{" "}
            skill categories
          </h2>
          <p className="text-slate-500 font-body-base text-lg leading-relaxed text-pretty">
            From engineering to creative and virtual assistance — browse
            specialists vetted for remote collaboration with global employers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 reveal-item">
          {LANDING_SKILL_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <article
                key={category.id}
                className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm card-premium-hover min-w-0"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#22c55e] mb-4">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{category.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {category.description}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {category.skills.slice(0, 4).map((skill) => (
                    <li
                      key={skill}
                      className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="landing-skills-marquee reveal-item overflow-hidden rounded-2xl border border-slate-100 bg-white/60 backdrop-blur-sm py-4">
          <MarqueeRow />
          <MarqueeRow reverse />
        </div>
      </div>
    </section>
  );
}
