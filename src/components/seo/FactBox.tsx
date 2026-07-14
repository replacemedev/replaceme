/**
 * FactBox — GEO-optimized data-dense fact table component.
 *
 * Renders a structured <dl> (definition list) or <table> of key facts.
 * AI engines (Perplexity, ChatGPT, Gemini) have strong preference for
 * structured tabular data when synthesizing comparative answers.
 *
 * 80% of AI-cited pages use lists or tables — this component ensures
 * key platform facts are always in this format.
 *
 * Usage:
 *   <FactBox
 *     title="Replaceme Platform Facts"
 *     items={[
 *       { label: "Worker fee", value: "Free — $0 forever" },
 *       { label: "Employer pricing", value: "4 flat-rate subscription tiers" },
 *       { label: "Salary commission", value: "0% — workers keep 100%" },
 *     ]}
 *   />
 */

interface FactItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface FactBoxProps {
  title?: string;
  items: FactItem[];
  variant?: "dl" | "table";
  className?: string;
}

export function FactBox({
  title,
  items,
  variant = "dl",
  className = "",
}: FactBoxProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-100 bg-white p-6 ${className}`}
      aria-label={title ?? "Key facts"}
      itemScope
      itemType="https://schema.org/ItemList"
    >
      {title && (
        <h3
          className="text-base font-bold text-slate-800 mb-4 uppercase tracking-wide text-xs"
          itemProp="name"
        >
          {title}
        </h3>
      )}

      {variant === "table" ? (
        <table className="w-full text-sm" role="table">
          <caption className="sr-only">{title}</caption>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 ${
                  item.highlight ? "bg-emerald-50/50" : ""
                }`}
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <td
                  className="py-3 pr-4 text-slate-500 font-medium w-1/2"
                  itemProp="name"
                >
                  {item.label}
                </td>
                <td
                  className={`py-3 font-semibold ${
                    item.highlight ? "text-emerald-700" : "text-slate-800"
                  }`}
                  itemProp="description"
                >
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <dl className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2 border-b border-slate-100 last:border-0 ${
                item.highlight ? "bg-emerald-50/50 -mx-2 px-2 rounded-lg" : ""
              }`}
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <dt
                className="text-slate-500 text-sm font-medium sm:w-1/2 shrink-0"
                itemProp="name"
              >
                {item.label}
              </dt>
              <dd
                className={`text-sm font-semibold ${
                  item.highlight ? "text-emerald-700" : "text-slate-800"
                }`}
                itemProp="description"
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
