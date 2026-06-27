import { notFound } from "next/navigation";
import { getEmployerCandidateProfile } from "@/actions/employer/hiring";
import { EmployerCandidateProfile } from "@/components/employer/candidates/EmployerCandidateProfile";

export const metadata = {
  title: "Candidate Profile | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerCandidatePage({
  params,
  searchParams,
}: {
  params: Promise<{ candidateId: string }>;
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { candidateId } = await params;
  const { jobId } = await searchParams;

  if (!jobId) {
    notFound();
  }

  const profile = await getEmployerCandidateProfile(candidateId, jobId);
  if (!profile) {
    notFound();
  }

  return <EmployerCandidateProfile profile={profile} />;
}
