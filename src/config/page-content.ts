import type { PageContentDefinition } from "@/types/page-content";

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
  {
    slug: "auth-login",
    label: "Sign In Screen",
    publicPath: "/signin",
    contentType: "json",
    description: "Sign in page headline, description, and testimonial copy.",
  },
  {
    slug: "auth-signup",
    label: "Sign Up Screen",
    publicPath: "/signup",
    contentType: "json",
    description: "Sign up page headline, description, and footer prompt.",
  },
  {
    slug: "auth-forgot-password",
    label: "Forgot Password Screen",
    publicPath: "/signin?view=forgot_password",
    contentType: "json",
    description: "Forgot-password view headline, description, and optional testimonial.",
  },
  {
    slug: "auth-update-password",
    label: "Update Password Screen",
    publicPath: "/update-password",
    contentType: "json",
    description: "Password reset form headline, description, and optional testimonial.",
  },
  {
    slug: "employer-faq",
    label: "Employer FAQs",
    publicPath: "/faq/employer",
    contentType: "json",
    description: "Employer FAQ questions and answers shown on the public site.",
  },
  {
    slug: "worker-faq",
    label: "Worker FAQs",
    publicPath: "/faq/worker",
    contentType: "json",
    description: "Worker FAQ questions and answers shown on the public site.",
  },
];

export const PAGE_CONTENT_TAG = "page-content";

export const PAGE_CONTENT_SLUGS = [
  "privacy-policy",
  "terms-of-service",
  "pricing",
  "help-index",
  "help-hiring-guide",
  "contact",
  "auth-login",
  "auth-signup",
  "auth-forgot-password",
  "auth-update-password",
  "employer-faq",
  "worker-faq",
] as const;

export type PageContentSlug = (typeof PAGE_CONTENT_SLUGS)[number];
