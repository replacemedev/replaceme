/**
 * Lightweight keyword overlap scorer for job ↔ worker match %.
 * Not ML — transparent token overlap capped 0–100 for ATS display.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "will",
  "you",
  "your",
  "our",
  "we",
  "this",
  "that",
  "have",
  "has",
  "can",
  "able",
]);

function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s,/|;·•\-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
  return new Set(tokens);
}

export type MatchScoreInput = {
  jobTitle?: string | null;
  jobDescription?: string | null;
  jobSkills?: string[] | null;
  workerSkills?: string[] | null;
  workerTitle?: string | null;
  workerBio?: string | null;
  coverLetter?: string | null;
  applicationSubject?: string | null;
};

/**
 * Returns 0–100. Skills overlap is weighted higher than free-text tokens.
 */
export function computeKeywordMatchScore(input: MatchScoreInput): number {
  const jobSkillSet = new Set(
    (input.jobSkills ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean)
  );
  const workerSkillSet = new Set(
    (input.workerSkills ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean)
  );

  let skillHits = 0;
  for (const skill of jobSkillSet) {
    if (workerSkillSet.has(skill)) {
      skillHits += 1;
      continue;
    }
    for (const ws of workerSkillSet) {
      if (ws.includes(skill) || skill.includes(ws)) {
        skillHits += 0.75;
        break;
      }
    }
  }
  const skillScore =
    jobSkillSet.size > 0
      ? Math.min(100, (skillHits / jobSkillSet.size) * 100)
      : 0;

  const jobText = [
    input.jobTitle ?? "",
    input.jobDescription ?? "",
    ...(input.jobSkills ?? []),
  ].join(" ");
  const workerText = [
    input.workerTitle ?? "",
    input.workerBio ?? "",
    input.coverLetter ?? "",
    input.applicationSubject ?? "",
    ...(input.workerSkills ?? []),
  ].join(" ");

  const jobTokens = tokenize(jobText);
  const workerTokens = tokenize(workerText);

  let textHits = 0;
  for (const token of jobTokens) {
    if (workerTokens.has(token)) textHits += 1;
  }
  const textScore =
    jobTokens.size > 0 ? Math.min(100, (textHits / jobTokens.size) * 100) : 0;

  if (jobSkillSet.size === 0 && jobTokens.size === 0) return 0;

  const blended =
    jobSkillSet.size > 0
      ? skillScore * 0.65 + textScore * 0.35
      : textScore;

  return Math.max(0, Math.min(100, Math.round(blended)));
}
