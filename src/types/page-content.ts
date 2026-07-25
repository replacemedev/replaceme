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
  icon?: string;
}

export interface HelpCategoryConfig {
  id: string;
  title: string;
  description?: string;
  articles: HelpArticleConfig[];
}

export interface HelpIndexConfig {
  title: string;
  description: string;
  categories?: HelpCategoryConfig[];
  articles?: HelpArticleConfig[];
}

export interface ContactPageConfig {
  badge: string;
  title: string;
  description: string;
  email: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface FaqPageConfig {
  items: FaqEntry[];
}
