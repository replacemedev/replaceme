import { notFound, redirect } from "next/navigation";
import { getPublicJobById } from "@/actions/public/growth";
import { getNavSession } from "@/lib/auth/nav-session";
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
  const [job, session] = await Promise.all([getPublicJobById(id), getNavSession()]);

  if (!job) notFound();

  if (session.isAuthenticated && session.role === "worker") {
    redirect(`/worker/jobs/${id}`);
  }

  return <PublicJobDetail job={job} />;
}
