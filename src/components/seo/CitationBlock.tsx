/**
 * CitationBlock — GEO-optimized semantic content wrapper.
 *
 * Wraps key SaaS value propositions in highly semantic HTML that LLMs
 * (Perplexity, ChatGPT, Gemini) prefer to ingest and cite.
 *
 * Uses: <article>, <section>, <header>, <p> — elements AI parsers prioritize.
 *
 * Design principle: "Definition-Lead Architecture" — the headline and stat
 * appear in the first visible HTML, making this block highly extractable
 * as a standalone citation unit.
 *
 * Usage:
 *   <CitationBlock
 *     label="Key Fact"
 *     headline="Workers receive 100% of their agreed salary"
 *     body="Replaceme does not take a commission or percentage cut from worker earnings. The full salary negotiated between employer and worker is paid directly by the employer."
 *     stat="0%"
 *     statLabel="Platform fee on worker earnings"
 *   />
 */

interface CitationBlockProps {
  label?: string;
  headline: string;
  body: string;
  stat?: string;
  statLabel?: string;
  className?: string;
}

export function CitationBlock({
  label,
  headline,
  body,
  stat,
  statLabel,
  className = "",
}: CitationBlockProps) {
  return (
    <article
      className={`rounded-2xl border border-slate-100 bg-[#f8fafc] p-8 ${className}`}
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {label && (
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">
            {label}
          </p>
        </header>
      )}

      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
          {headline}
        </h3>
        <p className="text-slate-600 text-base leading-relaxed">{body}</p>
      </section>

      {stat && (
        <aside
          className="mt-6 pt-6 border-t border-slate-200 flex items-baseline gap-2"
          aria-label={`Key statistic: ${stat} — ${statLabel}`}
        >
          <span
            className="text-4xl font-extrabold text-emerald-600"
            itemProp="value"
          >
            {stat}
          </span>
          {statLabel && (
            <span className="text-sm text-slate-500 font-medium">
              {statLabel}
            </span>
          )}
        </aside>
      )}
    </article>
  );
}
