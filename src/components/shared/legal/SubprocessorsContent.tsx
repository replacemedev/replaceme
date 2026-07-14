import Link from "next/link";

const SUBPROCESSORS = [
  {
    name: "Vercel Inc.",
    purpose: "Application hosting, edge network, serverless functions",
    location: "United States (global edge)",
    dpa: "https://vercel.com/legal/dpa",
  },
  {
    name: "Supabase, Inc.",
    purpose: "PostgreSQL database, authentication, file storage",
    location: "Configurable project region (document in ops runbook)",
    dpa: "https://supabase.com/legal/dpa",
  },
  {
    name: "Stripe, Inc.",
    purpose: "Payment processing, billing, invoicing",
    location: "United States / global",
    dpa: "https://stripe.com/legal/dpa",
  },
  {
    name: "Resend, Inc.",
    purpose: "Transactional and product email delivery",
    location: "United States",
    dpa: "https://resend.com/legal/dpa",
  },
  {
    name: "Upstash, Inc.",
    purpose: "Redis for rate limiting and login lockout",
    location: "Configurable region",
    dpa: "https://upstash.com/legal/dpa",
  },
  {
    name: "Cloudflare, Inc.",
    purpose: "Turnstile bot protection; optional WAF / DNS",
    location: "Global edge",
    dpa: "https://www.cloudflare.com/cloudflare-customer-dpa/",
  },
] as const;

/**
 * Public subprocessor inventory. Keep in sync with docs/security/dpa-and-subprocessors.md.
 */
export function SubprocessorsContent() {
  return (
    <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
      <p>
        Replaceme engages the following third-party subprocessors to help provide the
        Service. This list may be updated as our infrastructure evolves. Enterprise
        customers with a signed DPA should receive notice of material changes as set
        out in their agreement.
      </p>

      <div className="overflow-x-auto not-prose">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4 font-semibold text-slate-900">Subprocessor</th>
              <th className="py-3 pr-4 font-semibold text-slate-900">Purpose</th>
              <th className="py-3 pr-4 font-semibold text-slate-900">Location</th>
              <th className="py-3 font-semibold text-slate-900">DPA</th>
            </tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map((row) => (
              <tr key={row.name} className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium text-slate-900">{row.name}</td>
                <td className="py-3 pr-4 text-slate-600">{row.purpose}</td>
                <td className="py-3 pr-4 text-slate-600">{row.location}</td>
                <td className="py-3">
                  <a
                    href={row.dpa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#16a34a] underline-offset-2 hover:underline"
                  >
                    DPA
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        Related:{" "}
        <Link href="/privacy-policy" className="text-[#16a34a] underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        . Ops checklist for executed DPAs:{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">docs/security/dpa-and-subprocessors.md</code>
        .
      </p>
    </div>
  );
}
