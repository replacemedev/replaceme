import type { PageContentDefinition } from "@/types/page-content";

export const PAGE_CONTENT_TAG = "page-content";

export const PAGE_CONTENT_DEFINITIONS: PageContentDefinition[] = [
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    publicPath: "/privacy-policy",
    contentType: "html",
    description: "Long-form privacy policy (HTML). Falls back to built-in copy when empty.",
  },
  {
    slug: "terms-of-service",
    label: "Terms of Service",
    publicPath: "/terms-of-service",
    contentType: "html",
    description: "Long-form terms (HTML). Falls back to built-in copy when empty.",
  },
  {
    slug: "pricing",
    label: "Public Pricing",
    publicPath: "/pricing",
    contentType: "json",
    description: "Hero headline and description for the public pricing page.",
  },
  {
    slug: "help-index",
    label: "Help Center",
    publicPath: "/help",
    contentType: "json",
    description: "Help center title, intro, and article cards.",
  },
  {
    slug: "help-hiring-guide",
    label: "Hiring Guide",
    publicPath: "/help/hiring-guide",
    contentType: "html",
    description: "Employer hiring guide body (HTML).",
  },
  {
    slug: "contact",
    label: "Contact",
    publicPath: "/contact",
    contentType: "json",
    description: "Contact page headline and support email.",
  },
];

export const PAGE_CONTENT_SLUGS = [
  "privacy-policy",
  "terms-of-service",
  "pricing",
  "help-index",
  "help-hiring-guide",
  "contact",
] as const;

export type PageContentSlug = (typeof PAGE_CONTENT_SLUGS)[number];
