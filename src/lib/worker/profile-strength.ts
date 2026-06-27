export type WorkerProfileStrengthInput = {
  professionalTitle?: string | null;
  bio?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  cvUrl?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  avatarUrl?: string | null;
  skillCount: number;
};

export function computeWorkerProfileStrength(
  input: WorkerProfileStrengthInput
): { percentage: number; label: string } {
  let score = 0;

  if (input.professionalTitle?.trim()) score += 12;
  if (input.bio?.trim() && input.bio.length >= 40) score += 15;
  else if (input.bio?.trim()) score += 8;
  if (input.location?.trim()) score += 10;
  if (input.hourlyRate && input.hourlyRate > 0) score += 10;
  if (input.availability?.trim()) score += 8;
  if (input.resumeUrl?.trim() || input.cvUrl?.trim()) score += 20;
  if (input.portfolioUrl?.trim()) score += 10;
  if (input.avatarUrl?.trim()) score += 5;
  if (input.skillCount >= 3) score += 15;
  else if (input.skillCount >= 1) score += 8;

  const percentage = Math.min(100, score);
  const label =
    percentage >= 85
      ? "Strong"
      : percentage >= 60
        ? "Good"
        : percentage >= 35
          ? "Growing"
          : "Getting started";

  return { percentage, label };
}
