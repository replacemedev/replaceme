export interface PublicNavLink {
  href: string;
  label: string;
}

/** Footer / secondary discoverability — not shown in the guest header. */
export const PUBLIC_GROWTH_NAV: PublicNavLink[] = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

/** Guest header — scroll anchors into landing page sections only. */
export const GUEST_HEADER_NAV = [
  { id: "how-it-works", label: "How it Works" },
  { id: "find-work", label: "Find Work" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const;

export const PUBLIC_HELP_ARTICLES = [
  {
    href: "/help/hiring-guide",
    title: "Employer Hiring Guide",
    description:
      "How to write job posts, evaluate applicants, and hire remote talent on ReplaceMe.",
  },
  {
    href: "/contact",
    title: "Contact Support",
    description: "Reach our team for billing, account, or platform questions.",
  },
  {
    href: "/terms-of-service",
    title: "Terms of Service",
    description: "Platform rules and acceptable use for all roles.",
  },
  {
    href: "/privacy-policy",
    title: "Privacy Policy",
    description: "How we collect, store, and protect your data.",
  },
] as const;
