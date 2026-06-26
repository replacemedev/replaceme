import { notFound } from "next/navigation";
import { getPublicJobById } from "@/actions/public/growth";
import { PublicJobDetail } from "@/components/public/PublicJobDetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  return {
    title: job ? `${job.title} | ReplaceMe` : "Job | ReplaceMe",
  };
}

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getPublicJobById(id);
  if (!job) notFound();
  return <PublicJobDetail job={job} />;
}
