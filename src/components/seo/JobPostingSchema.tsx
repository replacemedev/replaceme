/**
 * JobPostingSchema — Google for Jobs + AI citation structured data.
 *
 * Emits nothing when required fields are missing (invalid JSON-LD is worse
 * than no schema). Maps employment enums strictly; omits salary when ≤ 0.
 */

import { JsonLd } from "./JsonLd";

interface JobPostingSchemaProps {
  job: {
    id: string;
    title: string;
    description: string;
    companyName: string;
    location: string;
    employmentType: string;
    monthlySalary: number;
    salaryCurrency: string;
    createdAt: string;
    updatedAt: string;
    skills: string[];
    company?: {
      logoUrl: string | null;
      websiteUrl: string | null;
    };
  };
  baseUrl?: string;
}

const EMPLOYMENT_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  fulltime: "FULL_TIME",
  "full time": "FULL_TIME",
  "part-time": "PART_TIME",
  parttime: "PART_TIME",
  "part time": "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  freelance: "CONTRACTOR",
  temporary: "TEMPORARY",
  intern: "INTERN",
  internship: "INTERN",
  volunteer: "VOLUNTEER",
  other: "OTHER",
};

function normalizeEmploymentType(type: string): string | null {
  const key = type.toLowerCase().trim();
  return EMPLOYMENT_MAP[key] ?? null;
}

function isRemoteLocation(location: string): boolean {
  return /remote|work\s*from\s*home|wfh|anywhere/i.test(location);
}

export function JobPostingSchema({ job, baseUrl }: JobPostingSchemaProps) {
  const siteUrl =
    baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

  // Required by Google JobPosting guidelines — skip rather than emit invalid.
  if (!job.title?.trim() || !job.companyName?.trim() || !job.createdAt) {
    return null;
  }

  const description =
    job.description?.trim() ||
    `${job.title} position at ${job.companyName}. Remote role open to Filipino professionals on Replaceme.`;

  const employmentType = normalizeEmploymentType(job.employmentType);
  const remote = isRemoteLocation(job.location);
  const datePosted = new Date(job.createdAt).toISOString().split("T")[0];
  const dateModified = new Date(job.updatedAt || job.createdAt)
    .toISOString()
    .split("T")[0];
  const validThrough = new Date(
    new Date(job.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: job.companyName,
      value: job.id,
    },
    datePosted,
    dateModified,
    validThrough,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      ...(job.company?.logoUrl && { logo: job.company.logoUrl }),
      ...(job.company?.websiteUrl && { sameAs: job.company.websiteUrl }),
    },
    url: `${siteUrl}/jobs/${job.id}`,
    directApply: true,
  };

  if (employmentType) schema.employmentType = employmentType;

  if (remote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Philippines",
    };
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PH",
        addressLocality: "Philippines",
      },
    };
  } else {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PH",
        addressLocality: job.location || "Philippines",
      },
    };
  }

  if (job.monthlySalary > 0) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency || "PHP",
      value: {
        "@type": "QuantitativeValue",
        value: job.monthlySalary,
        unitText: "MONTH",
      },
    };
  }

  if (job.skills.length > 0) {
    schema.skills = job.skills.join(", ");
  }

  return <JsonLd schema={schema} />;
}
