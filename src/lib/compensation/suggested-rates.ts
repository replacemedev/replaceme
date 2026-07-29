import { ORDERED_SKILLS, PRIORITY_SKILLS } from "@/data/skills";

export type SuggestedRateRange = {
  min: number;
  max: number;
  suggested: number;
  currency: "USD";
};

const DEFAULT_RANGE: SuggestedRateRange = {
  min: 8,
  max: 25,
  suggested: 12,
  currency: "USD",
};

/** Stable hourly USD ranges by primary skill category (not random). */
const SKILL_RANGES: Record<string, SuggestedRateRange> = {
  "Virtual Assistant": { min: 6, max: 14, suggested: 9, currency: "USD" },
  "Executive Assistant": { min: 10, max: 22, suggested: 15, currency: "USD" },
  "Video Editor": { min: 10, max: 28, suggested: 16, currency: "USD" },
  "Graphic Designer": { min: 8, max: 24, suggested: 14, currency: "USD" },
  "Social Media Manager": { min: 8, max: 20, suggested: 12, currency: "USD" },
  "Customer Support": { min: 6, max: 14, suggested: 9, currency: "USD" },
  "Web Developer": { min: 15, max: 45, suggested: 25, currency: "USD" },
  "Appointment Setter": { min: 6, max: 12, suggested: 8, currency: "USD" },
  Copywriter: { min: 10, max: 28, suggested: 16, currency: "USD" },
  "Data Entry": { min: 5, max: 10, suggested: 7, currency: "USD" },
  "Marketing Specialist": { min: 10, max: 26, suggested: 16, currency: "USD" },
  "Sales Representative": { min: 8, max: 20, suggested: 12, currency: "USD" },
  Bookkeeper: { min: 10, max: 22, suggested: 14, currency: "USD" },
  "E-commerce Manager": { min: 12, max: 28, suggested: 18, currency: "USD" },
  "Project Manager": { min: 14, max: 35, suggested: 22, currency: "USD" },
  "UI/UX Designer": { min: 14, max: 40, suggested: 24, currency: "USD" },
  "Shopify Developer": { min: 15, max: 40, suggested: 26, currency: "USD" },
  "WordPress Developer": { min: 12, max: 32, suggested: 20, currency: "USD" },
  "SEO Specialist": { min: 10, max: 28, suggested: 16, currency: "USD" },
  "Google Ads Specialist": { min: 12, max: 30, suggested: 18, currency: "USD" },
};

const TITLE_KEYWORDS: Array<{ pattern: RegExp; range: SuggestedRateRange }> = [
  { pattern: /developer|engineer|programmer/i, range: SKILL_RANGES["Web Developer"] },
  { pattern: /designer|design/i, range: SKILL_RANGES["Graphic Designer"] },
  { pattern: /video|editor/i, range: SKILL_RANGES["Video Editor"] },
  { pattern: /virtual assistant|va\b/i, range: SKILL_RANGES["Virtual Assistant"] },
  { pattern: /marketing|seo|ads/i, range: SKILL_RANGES["Marketing Specialist"] },
  { pattern: /support|customer/i, range: SKILL_RANGES["Customer Support"] },
  { pattern: /sales|setter/i, range: SKILL_RANGES["Sales Representative"] },
];

export function getSuggestedHourlyRate(input: {
  title?: string;
  skills?: string[];
}): SuggestedRateRange {
  const skills = input.skills ?? [];
  for (const skill of skills) {
    const direct = SKILL_RANGES[skill];
    if (direct) return direct;
    const priority = PRIORITY_SKILLS.find(
      (p) => p.toLowerCase() === skill.toLowerCase()
    );
    if (priority && SKILL_RANGES[priority]) return SKILL_RANGES[priority];
  }

  const title = input.title?.trim() ?? "";
  for (const { pattern, range } of TITLE_KEYWORDS) {
    if (pattern.test(title)) return range;
  }

  if (skills.length > 0) {
    const first = skills[0];
    const inCatalog = ORDERED_SKILLS.find(
      (s) => s.toLowerCase() === first.toLowerCase()
    );
    if (inCatalog?.toLowerCase().includes("develop")) {
      return SKILL_RANGES["Web Developer"];
    }
  }

  return DEFAULT_RANGE;
}
