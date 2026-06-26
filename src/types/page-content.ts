export type PageContentType = "html" | "json";

export interface PageContentRow {
  id: string;
  slug: string;
  title: string;
  contentType: PageContentType;
  body: string | null;
  contentJson: Record<string, unknown>;
  meta: PageContentMeta;
  isPublished: boolean;
  updatedAt: string;
}

export interface PageContentMeta {
  lastUpdated?: string;
  badge?: string;
  badgeVariant?: "pill" | "text";
  wide?: boolean;
  description?: string;
}

export interface PricingPageConfig {
  headline: string;
  description: string;
}

export interface HelpArticleConfig {
  href: string;
  title: string;
  description: string;
}

export interface HelpIndexConfig {
  title: string;
  description: string;
  articles: HelpArticleConfig[];
}

export interface ContactPageConfig {
  badge: string;
  title: string;
  description: string;
  email: string;
}

export interface AuthScreenConfig {
  headline: string;
  description: string;
  signupPrompt?: string;
  signupLinkLabel?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialRole?: string;
}

export type AuthScreenSlug = "auth-login" | "auth-signup";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface FaqPageConfig {
  items: FaqEntry[];
}

export interface PageContentDefinition {
  slug: string;
  label: string;
  publicPath: string;
  contentType: PageContentType;
  description: string;
}
