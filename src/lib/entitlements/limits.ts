export function isActiveJobLimitReached(
  activeJobsCount: number,
  activeJobsLimit: number | null
): boolean {
  return (
    activeJobsLimit !== null && activeJobsCount >= activeJobsLimit
  );
}

export function isApplicantCapNear(
  applicantCount: number,
  applicantsPerJobLimit: number | null,
  threshold = 0.8
): boolean {
  if (applicantsPerJobLimit === null) return false;
  return applicantCount >= Math.ceil(applicantsPerJobLimit * threshold);
}

export function hasPriorityListing(planSlug: string): boolean {
  const slug = planSlug.toLowerCase();
  return slug === "growth" || slug === "scale";
}
