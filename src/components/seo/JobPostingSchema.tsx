/**
 * JobPostingSchema — Google for Jobs structured data component.
 *
 * Injects a JobPosting JSON-LD script enabling:
 *  - Google for Jobs rich results (massive organic traffic signal)
 *  - AI search engine job indexing (Perplexity, ChatGPT job search features)
 *
 * Usage:
 *   <JobPostingSchema job={jobObject} baseUrl={BASE_URL} />
 *
 * Place in the server component for /jobs/[id]/page.tsx.
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

/** Normalize employment type strings to schema.org valid values */
function normalizeEmploymentType(type: string): string {
  const map: Record<string, string> = {
    "full-time": "FULL_TIME",
    fulltime: "FULL_TIME",
    "part-time": "PART_TIME",
    parttime: "PART_TIME",
    contract: "CONTRACTOR",
    freelance: "CONTRACTOR",
    temporary: "TEMPORARY",
    intern: "INTERN",
    internship: "INTERN",
    volunteer: "VOLUNTEER",
    other: "OTHER",
  };
  return map[type.toLowerCase()] ?? "FULL_TIME";
}

export function JobPostingSchema({ job, baseUrl }: JobPostingSchemaProps) {
  const siteUrl = baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || `${job.title} position at ${job.companyName}. Remote role open to Filipino professionals.`,
    identifier: {
      "@type": "PropertyValue",
      name: job.companyName,
      value: job.id,
    },
    datePosted: new Date(job.createdAt).toISOString().split("T")[0],
    validThrough: new Date(
      new Date(job.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0], // 90 days validity
    employmentType: normalizeEmploymentType(job.employmentType),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      ...(job.company?.logoUrl && { logo: job.company.logoUrl }),
      ...(job.company?.websiteUrl && { sameAs: job.company.websiteUrl }),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PH",
        addressLocality: job.location !== "Remote" ? job.location : "Philippines",
      },
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Philippines",
    },
    ...(job.monthlySalary > 0 && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salaryCurrency ?? "PHP",
        value: {
          "@type": "QuantitativeValue",
          value: job.monthlySalary,
          unitText: "MONTH",
        },
      },
    }),
    skills: job.skills.join(", "),
    url: `${siteUrl}/jobs/${job.id}`,
    directApply: true,
  };

  return <JsonLd schema={schema} />;
}
