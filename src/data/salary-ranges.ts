export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  label: string;
}

const RANGES: Record<string, SalaryRange> = {
  "Virtual Assistant": { min: 5, max: 15, currency: "USD", label: "$5–$15/hr" },
  "Video Editor": { min: 8, max: 25, currency: "USD", label: "$8–$25/hr" },
  "Graphic Designer": { min: 8, max: 30, currency: "USD", label: "$8–$30/hr" },
  "Social Media Manager": { min: 6, max: 20, currency: "USD", label: "$6–$20/hr" },
  "Customer Support": { min: 4, max: 12, currency: "USD", label: "$4–$12/hr" },
  "Web Developer": { min: 15, max: 50, currency: "USD", label: "$15–$50/hr" },
  "Appointment Setter": { min: 4, max: 12, currency: "USD", label: "$4–$12/hr" },
  "Copywriter": { min: 8, max: 25, currency: "USD", label: "$8–$25/hr" },
  "Data Entry": { min: 3, max: 8, currency: "USD", label: "$3–$8/hr" },
  "Marketing Specialist": { min: 10, max: 30, currency: "USD", label: "$10–$30/hr" },
  "Sales Representative": { min: 6, max: 20, currency: "USD", label: "$6–$20/hr" },
  "Bookkeeper": { min: 8, max: 20, currency: "USD", label: "$8–$20/hr" },
  "E-commerce Manager": { min: 8, max: 25, currency: "USD", label: "$8–$25/hr" },
  "Project Manager": { min: 12, max: 40, currency: "USD", label: "$12–$40/hr" },
  "UI/UX Designer": { min: 12, max: 40, currency: "USD", label: "$12–$40/hr" },
  "Shopify Developer": { min: 12, max: 35, currency: "USD", label: "$12–$35/hr" },
  "WordPress Developer": { min: 10, max: 30, currency: "USD", label: "$10–$30/hr" },
  "SEO Specialist": { min: 6, max: 20, currency: "USD", label: "$6–$20/hr" },
  "Google Ads Specialist": { min: 8, max: 25, currency: "USD", label: "$8–$25/hr" },
  "Executive Assistant": { min: 6, max: 18, currency: "USD", label: "$6–$18/hr" },
};

const CATEGORY_RANGES: Record<string, SalaryRange> = {
  development: { min: 15, max: 50, currency: "USD", label: "$15–$50/hr" },
  design: { min: 8, max: 30, currency: "USD", label: "$8–$30/hr" },
  marketing: { min: 6, max: 20, currency: "USD", label: "$6–$20/hr" },
  support: { min: 4, max: 12, currency: "USD", label: "$4–$12/hr" },
  finance: { min: 8, max: 22, currency: "USD", label: "$8–$22/hr" },
  default: { min: 5, max: 15, currency: "USD", label: "$5–$15/hr" },
};

function getCategoryForTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("develop") || t.includes("engineer") || t.includes("programmer") || t.includes("coder")) return "development";
  if (t.includes("design") || t.includes("ui") || t.includes("ux") || t.includes("figma")) return "design";
  if (t.includes("market") || t.includes("seo") || t.includes("ads") || t.includes("social") || t.includes("content")) return "marketing";
  if (t.includes("support") || t.includes("service") || t.includes("customer") || t.includes("assistant") || t.includes("virtual")) return "support";
  if (t.includes("book") || t.includes("account") || t.includes("finance") || t.includes("payroll")) return "finance";
  return "default";
}

export function getSalaryRange(titleOrSkill: string): SalaryRange {
  if (RANGES[titleOrSkill]) return RANGES[titleOrSkill];
  const category = getCategoryForTitle(titleOrSkill);
  return CATEGORY_RANGES[category] ?? CATEGORY_RANGES.default;
}
