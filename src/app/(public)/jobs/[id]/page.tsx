import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import {
  getPublicJobById,
  trackPublicJobView,
} from "@/actions/public/growth";
import { getNavSession } from "@/lib/auth/nav-session";
import {
  PublicJobDetail,
  buildJobFaqs,
} from "@/components/public/PublicJobDetail";
import {
  BreadcrumbSchema,
  FAQSchema,
  JobPostingSchema,
} from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobById(id);

  if (!job) {
    return {
      title: "Job Not Found",
      description: "This job listing is no longer available.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${job.title} at ${job.companyName} — Remote Job Philippines`;
  const salaryHint =
    job.monthlySalary > 0
      ? ` — ${job.salaryCurrency} ${job.monthlySalary.toLocaleString()}/month`
      : "";
  const description = `${job.companyName} is hiring a ${job.title} on Replaceme. ${job.employmentType} role in ${job.location}${salaryHint}. Apply directly with no agency fees.`;
  const canonical = `${BASE_URL}/jobs/${id}`;

  return {
    title,
    description,
    keywords: [
      job.title,
      job.companyName,
      "remote job Philippines",
      "Filipino remote work",
      ...job.skills.slice(0, 5),
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "Replaceme",
      locale: "en_PH",
      // opengraph-image.tsx supplies the image for this route
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [job, session] = await Promise.all([
    getPublicJobById(id),
    getNavSession(),
  ]);

  if (!job) notFound();

  // Track once after response — getPublicJobById is cached (no double increment).
  after(() => {
    void trackPublicJobView(job.employerId, job.id);
  });

  if (session.isAuthenticated && session.role === "worker") {
    redirect(`/worker/jobs/${id}`);
  }

  const faqs = buildJobFaqs(job);

  return (
    <>
      <JobPostingSchema
        job={{
          id: job.id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          location: job.location,
          employmentType: job.employmentType,
          monthlySalary: job.monthlySalary,
          salaryCurrency: job.salaryCurrency,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          skills: job.skills,
          company: {
            logoUrl: job.company?.logoUrl ?? null,
            websiteUrl: job.company?.websiteUrl ?? null,
          },
        }}
        baseUrl={BASE_URL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Jobs", url: `${BASE_URL}/jobs` },
          { name: job.title, url: `${BASE_URL}/jobs/${job.id}` },
        ]}
      />
      <FAQSchema items={faqs} />
      <PublicJobDetail job={job} faqs={faqs} />
    </>
  );
}
