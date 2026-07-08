import { notFound, redirect } from "next/navigation";
import { getPublicJobById } from "@/actions/public/growth";
import { getNavSession } from "@/lib/auth/nav-session";
import { PublicJobDetail } from "@/components/public/PublicJobDetail";
import { JobPostingSchema } from "@/components/seo";
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
    };
  }

  const title = `${job.title} at ${job.companyName} \u2014 Remote Job Philippines`;
  const description = `${job.companyName} is hiring a ${job.title} on Replace Me. ${job.employmentType} remote role${job.monthlySalary > 0 ? ` \u2014 ${job.salaryCurrency} ${job.monthlySalary.toLocaleString()}/month` : ""}. Apply directly with no agency fees.`;

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
    alternates: {
      canonical: `${BASE_URL}/jobs/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/jobs/${id}`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [job, session] = await Promise.all([getPublicJobById(id), getNavSession()]);

  if (!job) notFound();

  if (session.isAuthenticated && session.role === "worker") {
    redirect(`/worker/jobs/${id}`);
  }

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
      <PublicJobDetail job={job} />
    </>
  );
}

