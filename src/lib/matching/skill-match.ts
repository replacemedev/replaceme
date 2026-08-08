import { computeKeywordMatchScore } from "@/lib/matching/keyword-match-score";

const MIN_MATCH_SCORE = 50;

/** Case-insensitive exact skill overlap (preserves job skill casing). */
export function overlappingSkills(
  jobSkills: string[] | null | undefined,
  workerSkills: string[] | null | undefined
): string[] {
  const workerLower = new Set(
    (workerSkills ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean)
  );
  const seen = new Set<string>();
  const hits: string[] = [];

  for (const skill of jobSkills ?? []) {
    const trimmed = skill.trim();
    const lower = trimmed.toLowerCase();
    if (!lower || seen.has(lower) || !workerLower.has(lower)) continue;
    seen.add(lower);
    hits.push(trimmed);
  }

  return hits;
}

export function scoreJobWorkerMatch(
  job: {
    title?: string | null;
    description?: string | null;
    skills?: string[] | null;
  },
  worker: {
    skills?: string[] | null;
    professional_title?: string | null;
    bio?: string | null;
  }
): { matchScore: number; overlappingSkills: string[]; qualifies: boolean } {
  const overlap = overlappingSkills(job.skills, worker.skills);
  const matchScore = computeKeywordMatchScore({
    jobTitle: job.title,
    jobDescription: job.description,
    jobSkills: job.skills,
    workerSkills: worker.skills,
    workerTitle: worker.professional_title,
    workerBio: worker.bio,
  });

  return {
    matchScore,
    overlappingSkills: overlap,
    qualifies: overlap.length >= 1 || matchScore >= MIN_MATCH_SCORE,
  };
}
