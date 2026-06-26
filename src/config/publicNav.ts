export interface PublicNavLink {
  href: string;
  label: string;
}

/** Guest marketing header + footer discoverability links. */
export const PUBLIC_GROWTH_NAV: PublicNavLink[] = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

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
