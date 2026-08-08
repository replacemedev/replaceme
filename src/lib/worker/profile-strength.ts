export type WorkerProfileStrengthInput = {
  professionalTitle?: string | null;
  bio?: string | null;
  location?: string | null;
  resumeUrl?: string | null;
  cvUrl?: string | null;
  availability?: string | null;
  hourlyRate?: number | null;
  avatarUrl?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  spokenLanguageCount: number;
  skillCount: number;
};

export function computeWorkerProfileStrength(
  input: WorkerProfileStrengthInput
): { percentage: number; label: string } {
  let score = 0;

  if (input.professionalTitle?.trim()) score += 8;
  if (input.bio?.trim() && input.bio.length >= 40) score += 10;
  if (input.location?.trim()) score += 8;
  if (input.hourlyRate && input.hourlyRate > 0) score += 8;
  if (input.availability?.trim()) score += 8;
  if (input.resumeUrl?.trim() || input.cvUrl?.trim()) score += 12;
  if (input.avatarUrl?.trim()) score += 16;
  if (input.gender?.trim()) score += 8;
  if (input.birthDate?.trim()) score += 8;
  if (input.spokenLanguageCount >= 1) score += 7;
  if (input.skillCount >= 3) score += 7;

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
