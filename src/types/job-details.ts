import { formatMoney } from "@/lib/format/currency";

export interface JobDetailsCompany {
  id: string;
  employerId: string;
  companyName: string;
  logoUrl: string | null;
  memberSince: string;
  websiteUrl: string | null;
  activeJobPostsCount: number;
}

export interface ParsedJobSections {
  introParagraphs: string[];
  responsibilities: string[];
  requirements: string[];
  expectations: string[];
  compensationFootnote: string | null;
}

export interface WorkerJobDetails {
  id: string;
  employerId: string;
  title: string;
  companyName: string;
  employmentType: string;
  description: string;
  parsedSections: ParsedJobSections;
  monthlySalary: number;
  salaryCurrency: string;
  hoursPerWeek: number;
  hourlyRate: number | null;
  location: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
  isSaved: boolean;
  hasApplied: boolean;
  company: JobDetailsCompany;
}

export type JobListIcon = "check" | "star" | "arrow";

export interface JobListSection {
  title: string;
  items: string[];
  icon: JobListIcon;
  footnote?: string;
}

const SECTION_HEADERS: Record<string, keyof Omit<ParsedJobSections, "introParagraphs">> = {
  responsibilities: "responsibilities",
  "requirements (flexible)": "requirements",
  requirements: "requirements",
  "what you can expect": "expectations",
  "what you can expect:": "expectations",
};

function isBulletLine(line: string): boolean {
  const t = line.trim();
  return /^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t);
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "");
}

/** Parse structured sections from employer-authored description text. */
export function parseJobDescription(description: string): ParsedJobSections {
  const result: ParsedJobSections = {
    introParagraphs: [],
    responsibilities: [],
    requirements: [],
    expectations: [],
    compensationFootnote: null,
  };

  if (!description.trim()) return result;

  const lines = description.split(/\r?\n/);
  let current: keyof ParsedJobSections | "intro" = "intro";
  let introBuffer: string[] = [];

  const flushIntro = () => {
    const text = introBuffer.join("\n").trim();
    if (text) {
      result.introParagraphs.push(
        ...text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
      );
    }
    introBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headerKey = line.replace(/:$/, "").toLowerCase();
    if (SECTION_HEADERS[headerKey]) {
      flushIntro();
      current = SECTION_HEADERS[headerKey];
      continue;
    }

    if (line.toLowerCase().startsWith("compensation")) {
      flushIntro();
      current = "compensationFootnote";
      const afterColon = line.split(":").slice(1).join(":").trim();
      if (afterColon) result.compensationFootnote = afterColon;
      continue;
    }

    if (line.startsWith("*") && line.endsWith("*")) {
      result.compensationFootnote = line.replace(/^\*+|\*+$/g, "").trim();
      continue;
    }

    if (current === "intro") {
      if (isBulletLine(line)) {
        flushIntro();
        current = "responsibilities";
        result.responsibilities.push(cleanBullet(line));
      } else {
        introBuffer.push(line);
      }
      continue;
    }

    if (current === "compensationFootnote") {
      result.compensationFootnote = result.compensationFootnote
        ? `${result.compensationFootnote} ${line}`
        : line;
      continue;
    }

    if (
      current === "responsibilities" ||
      current === "requirements" ||
      current === "expectations"
    ) {
      if (isBulletLine(line)) {
        result[current].push(cleanBullet(line));
      } else if (current === "requirements" && line.startsWith("*")) {
        result.compensationFootnote = line.replace(/^\*+|\*+$/g, "").trim();
      } else {
        const arr = result[current];
        if (arr.length > 0) {
          arr[arr.length - 1] = `${arr[arr.length - 1]} ${line}`;
        }
      }
      continue;
    }
  }

  flushIntro();
  return result;
}

export function buildListSections(parsed: ParsedJobSections): JobListSection[] {
  const sections: JobListSection[] = [];

  if (parsed.responsibilities.length > 0) {
    sections.push({
      title: "Responsibilities:",
      items: parsed.responsibilities,
      icon: "check",
    });
  }

  if (parsed.requirements.length > 0) {
    sections.push({
      title: "Requirements (Flexible):",
      items: parsed.requirements,
      icon: "star",
      footnote: parsed.compensationFootnote?.includes("experience")
        ? parsed.compensationFootnote
        : undefined,
    });
  }

  if (parsed.expectations.length > 0) {
    sections.push({
      title: "What You Can Expect:",
      items: parsed.expectations,
      icon: "arrow",
    });
  }

  return sections;
}

export function formatPostedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCompensation(
  monthlySalary: number,
  currency: string = "PHP",
  hoursPerWeek?: number
): string {
  if (hoursPerWeek && hoursPerWeek > 0) {
    const hourly = Math.round(monthlySalary / (hoursPerWeek * 4));
    return `${formatMoney(hourly, currency, { perHour: true })} (${formatMoney(monthlySalary, currency)}/mo)`;
  }
  return `${formatMoney(monthlySalary, currency)}/mo`;
}
