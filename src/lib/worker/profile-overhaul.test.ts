import { describe, expect, it } from "vitest";
import { computeWorkerProfileStrength } from "./profile-strength";
import { computeKeywordMatchScore } from "../matching/keyword-match-score";
import { scoreJobWorkerMatch } from "../matching/skill-match";
import {
  workerSkillsStepSchema,
  workerIdentityStepSchema,
  workerAboutStepSchema,
} from "../validations/onboarding";
import { workerEditDetailsSchema } from "../validations/worker/profile-inline";

describe("worker profile overhaul gates", () => {
  it("requires 3–6 skills", () => {
    expect(workerSkillsStepSchema.safeParse({ skills: ["a", "b"] }).success).toBe(
      false
    );
    expect(
      workerSkillsStepSchema.safeParse({
        skills: ["a", "b", "c"],
      }).success
    ).toBe(true);
    expect(
      workerSkillsStepSchema.safeParse({
        skills: ["1", "2", "3", "4", "5", "6", "7"],
      }).success
    ).toBe(false);
  });

  it("requires gender and spoken languages on identity", () => {
    const bad = workerIdentityStepSchema.safeParse({
      professionalTitle: "Editor",
      firstName: "Ana",
      lastName: "Reyes",
      gender: "Male",
      spokenLanguages: [],
    });
    expect(bad.success).toBe(false);

    const ok = workerIdentityStepSchema.safeParse({
      professionalTitle: "Editor",
      firstName: "Ana",
      lastName: "Reyes",
      gender: "Female",
      spokenLanguages: ["English", "Tagalog"],
    });
    expect(ok.success).toBe(true);
  });

  it("requires birth date on about step", () => {
    expect(workerAboutStepSchema.safeParse({ bio: "Hi" }).success).toBe(false);
    expect(
      workerAboutStepSchema.safeParse({
        bio: "Hello world bio",
        birthDate: "1995-04-12",
      }).success
    ).toBe(true);
  });

  it("scores 100 only when mandate fields are complete", () => {
    const incomplete = computeWorkerProfileStrength({
      professionalTitle: "VA",
      bio: "x".repeat(40),
      location: "Manila",
      hourlyRate: 20,
      availability: "Full-time",
      resumeUrl: "https://example.com/r.pdf",
      avatarUrl: null,
      gender: null,
      birthDate: null,
      spokenLanguageCount: 0,
      skillCount: 3,
    });
    expect(incomplete.percentage).toBeLessThan(100);

    const complete = computeWorkerProfileStrength({
      professionalTitle: "VA",
      bio: "x".repeat(40),
      location: "Manila",
      hourlyRate: 20,
      availability: "Full-time",
      resumeUrl: "https://example.com/r.pdf",
      avatarUrl: "https://example.com/a.jpg",
      gender: "Female",
      birthDate: "1995-04-12",
      spokenLanguageCount: 2,
      skillCount: 3,
    });
    expect(complete.percentage).toBe(100);
  });

  it("scores skill overlap for matching", () => {
    const score = computeKeywordMatchScore({
      jobTitle: "Video Editor",
      jobSkills: ["Video Editing", "Premiere Pro"],
      workerSkills: ["Video Editing", "Photoshop"],
      workerTitle: "Senior Video Editor",
    });
    expect(score).toBeGreaterThanOrEqual(50);
  });

  it("recomputes overlap when job or worker skills change", () => {
    const before = scoreJobWorkerMatch(
      {
        title: "Senior React Developer",
        description: null,
        skills: ["TypeScript", "React"],
      },
      {
        skills: ["TypeScript"],
        professional_title: "Developer",
        bio: null,
      }
    );
    expect(before.overlappingSkills).toEqual(["TypeScript"]);
    expect(before.qualifies).toBe(true);

    const afterJobSkillsChange = scoreJobWorkerMatch(
      {
        title: "Senior React Developer",
        description: null,
        skills: ["Video Editor", "Web Developer"],
      },
      {
        skills: ["TypeScript"],
        professional_title: "Developer",
        bio: null,
      }
    );
    expect(afterJobSkillsChange.overlappingSkills).toEqual([]);

    const afterWorkerSkillsChange = scoreJobWorkerMatch(
      {
        title: "Senior React Developer",
        description: null,
        skills: ["Video Editor", "Web Developer"],
      },
      {
        skills: ["Web Developer", "Video Editor"],
        professional_title: "Developer",
        bio: null,
      }
    );
    expect(afterWorkerSkillsChange.overlappingSkills).toEqual([
      "Video Editor",
      "Web Developer",
    ]);
    expect(afterWorkerSkillsChange.qualifies).toBe(true);
  });

  it("requires gender, DOB, and spoken languages on profile edit details", () => {
    expect(
      workerEditDetailsSchema.safeParse({
        firstName: "Ana",
        lastName: "Reyes",
        birthDate: "1995-04-12",
        gender: "",
        spokenLanguages: ["English"],
      }).success
    ).toBe(false);

    expect(
      workerEditDetailsSchema.safeParse({
        firstName: "Ana",
        lastName: "Reyes",
        birthDate: "1995-04-12",
        gender: "Female",
        spokenLanguages: ["English", "Tagalog"],
      }).success
    ).toBe(true);
  });
});
