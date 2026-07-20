/**
 * SEO Component Library — barrel export
 *
 * Central export for all SEO, GEO, and AEO schema components.
 * Import from "@/components/seo" rather than individual files.
 */

export { JsonLd } from "./JsonLd";
export { OrganizationSchema } from "./OrganizationSchema";
export { FAQSchema } from "./FAQSchema";
export type { FAQItem } from "./FAQSchema";
export { JobPostingSchema } from "./JobPostingSchema";
export { BreadcrumbSchema } from "./BreadcrumbSchema";
export type { BreadcrumbItem } from "./BreadcrumbSchema";
export { CitationBlock, CitationBlockSkeleton, CitationBlockGridSkeleton } from "./CitationBlock";
export { FactBox } from "./FactBox";

