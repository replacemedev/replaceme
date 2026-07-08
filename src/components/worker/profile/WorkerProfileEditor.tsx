"use client";

import { useState, useTransition } from "react";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import {
  Award,
  Briefcase,
  Check,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  Plus,
  Share2,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { patchWorkerProfile, deleteWorkerProject } from "@/actions/worker/profile";
import { formatMoney } from "@/lib/format/currency";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ProfileAvatarUpload } from "@/components/shared/ProfileAvatarUpload";
import { profileImageHelperText } from "@/lib/storage/profile-image";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SkillProgressBar } from "@/components/worker/profile/SkillProgressBar";
import { ProjectHighlightItem } from "@/components/worker/profile/ProjectHighlightItem";
import { TestimonialCard } from "@/components/worker/profile/TestimonialCard";
import { InlineEditableRow } from "@/components/worker/profile/inline/InlineEditableRow";
import { RateAvailabilityModal } from "@/components/worker/profile/inline/RateAvailabilityModal";
import { SkillsManageModal } from "@/components/worker/profile/inline/SkillsManageModal";
import { ProjectFormModal } from "@/components/worker/profile/inline/ProjectFormModal";
import type {
  WorkerProfile,
  WorkerSkillDetailed,
  WorkerProject,
  EmployerTestimonial,
} from "@/types/worker-profile";

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 82 }, (_, i) => CURRENT_YEAR - 18 - i);

export interface WorkerProfileEditorProps {
  profile: WorkerProfile;
  skills: WorkerSkillDetailed[];
  projects: WorkerProject[];
  testimonials: EmployerTestimonial[];
  reviewCount: number;
  averageRating: number;
  isOwner: boolean;
}

export function WorkerProfileEditor({
  profile: initialProfile,
  skills: initialSkills,
  projects: initialProjects,
  testimonials,
  reviewCount,
  averageRating,
  isOwner,
}: WorkerProfileEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [skills, setSkills] = useState(initialSkills);
  const [projects, setProjects] = useState(initialProjects);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkerProject | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [bioEditing, setBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio ?? "");
  const [birthYearEditing, setBirthYearEditing] = useState(false);
  const [birthYearDraft, setBirthYearDraft] = useState(
    profile.birth_year ? String(profile.birth_year) : ""
  );
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(profile.professional_title ?? "");
  const [, startTransition] = useTransition();

  function shareProfile() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/worker/profile?id=${profile.id}`
        : "";
    if (!url) return;

    if (navigator.share) {
      void navigator.share({ title: "My profile", url }).catch(() => {
        void navigator.clipboard.writeText(url);
        toast.success("Profile link copied");
      });
      return;
    }

    void navigator.clipboard.writeText(url).then(() => {
      toast.success("Profile link copied");
    });
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const age = profile.birth_year ? CURRENT_YEAR - profile.birth_year : null;
  const ageString =
    age && profile.birth_year ? `${age} (${profile.birth_year})` : "Not specified";

  const fullName =
    profile.full_name ||
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Worker Profile";
  const initials = profile.first_name ? profile.first_name[0].toUpperCase() : "W";

  async function saveProfileField(
    patch: Parameters<typeof patchWorkerProfile>[0]
  ) {
    const result = await patchWorkerProfile(patch);
    if (result.error) {
      toast.error(result.error);
      return { error: result.error };
    }
    setProfile((prev) => ({
      ...prev,
      ...(patch.firstName !== undefined ? { first_name: patch.firstName } : {}),
      ...(patch.lastName !== undefined ? { last_name: patch.lastName } : {}),
      ...(patch.professionalTitle !== undefined
        ? { professional_title: patch.professionalTitle }
        : {}),
      ...(patch.bio !== undefined ? { bio: patch.bio || null } : {}),
      ...(patch.location !== undefined ? { location: patch.location || null } : {}),
      ...(patch.portfolioUrl !== undefined
        ? { portfolio_url: patch.portfolioUrl || null }
        : {}),
      ...(patch.resumeUrl !== undefined ? { resume_url: patch.resumeUrl || null } : {}),
      ...(patch.cvUrl !== undefined ? { cv_url: patch.cvUrl || null } : {}),
      ...(patch.birthYear !== undefined ? { birth_year: patch.birthYear } : {}),
    }));
    return { success: true as const };
  }

  function saveBio() {
    startTransition(async () => {
      const result = await saveProfileField({ bio: bioDraft });
      if (!("error" in result)) {
        setBioEditing(false);
        toast.success("Bio updated");
      }
    });
  }

  function saveBirthYear() {
    startTransition(async () => {
      const year = birthYearDraft ? Number(birthYearDraft) : null;
      const result = await saveProfileField({ birthYear: year });
      if (!("error" in result)) {
        setBirthYearEditing(false);
        toast.success("Birth year updated");
      }
    });
  }

  function saveTitle() {
    startTransition(async () => {
      const result = await saveProfileField({
        professionalTitle: titleDraft || "Professional",
      });
      if (!("error" in result)) {
        setTitleEditing(false);
        toast.success("Title updated");
      }
    });
  }

  function confirmDeleteProject() {
    if (!deleteProjectId) return;
    startTransition(async () => {
      const result = await deleteWorkerProject(deleteProjectId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
      setDeleteProjectId(null);
      toast.success("Project removed");
    });
  }

  const bioParagraphs = profile.bio
    ? profile.bio.split("\n").filter((p) => p.trim() !== "")
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-[#0a4a29] to-[#006e2f] select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute -left-1/4 -top-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-12 order-2 lg:order-1">
          {/* About */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <User size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  About Me
                </h3>
              </div>
              {isOwner && !bioEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setBioDraft(profile.bio ?? "");
                    setBioEditing(true);
                  }}
                  className="text-xs font-bold text-[#006e2f] hover:text-[#005321] flex items-center gap-1"
                >
                  <Edit size={12} />
                  Edit
                </button>
              ) : null}
            </div>
            {bioEditing ? (
              <div className="space-y-3">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 resize-none"
                  placeholder="Tell employers about your experience and strengths…"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveBio}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#006e2f] px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <Check size={12} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setBioEditing(false)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : bioParagraphs.length > 0 ? (
              bioParagraphs.map((para, idx) => (
                <p key={idx} className="text-slate-600 font-medium text-sm leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-slate-400 font-semibold text-sm italic">
                {isOwner
                  ? "Add your story — click Edit above."
                  : "No bio provided yet."}
              </p>
            )}
          </div>

          {/* Top Skills */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <Award size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Top Skills
                </h3>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setSkillsModalOpen(true)}
                  className="text-xs font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
                >
                  Manage
                </button>
              ) : null}
            </div>
            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill) => (
                  <SkillProgressBar key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No skills listed yet.
              </p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <Briefcase size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Project Highlights
                </h3>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#006e2f] hover:text-[#005321] flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add
                </button>
              ) : null}
            </div>
            {projects.length > 0 ? (
              <div className="space-y-6 divide-y divide-slate-100">
                {projects.map((project, idx) => (
                  <div key={project.id} className={idx > 0 ? "pt-6" : ""}>
                    <div className="flex justify-end gap-1 mb-1">
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(project);
                              setProjectModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-[#006e2f] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProjectId(project.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            aria-label="Delete project"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : null}
                    </div>
                    <ProjectHighlightItem project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No projects showcased yet.
              </p>
            )}
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg shrink-0">
                  <Star size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Employer Testimonial Gallery
                </h3>
              </div>
              {reviewCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0 whitespace-nowrap">
                  <Star size={14} className="text-[#006e2f] fill-[#006e2f]" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-slate-400">({reviewCount} reviews)</span>
                </div>
              ) : null}
            </div>
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {testimonials.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} />
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No testimonials yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="relative -mt-20 lg:-mt-32 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 text-center space-y-6 z-10">
            {isOwner ? (
              <ProfileAvatarUpload
                avatarUrl={profile.avatar_url}
                displayName={fullName}
                size="xl"
                onAvatarChange={(url) =>
                  setProfile((current) => ({ ...current, avatar_url: url }))
                }
                helperText={profileImageHelperText()}
              />
            ) : (
              <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-md">
                <AvatarImage
                  src={profile.avatar_url}
                  alt={fullName}
                  initials={initials}
                  size="xl"
                  priority
                />
              </div>
            )}

            <div className="space-y-2 flex flex-col items-center">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
                {fullName}
                <VerifiedBadge show={Boolean(profile.is_verified)} size="md" />
              </h3>
              {titleEditing ? (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-center max-w-[220px]"
                  />
                  <button type="button" onClick={saveTitle} className="text-[#006e2f]">
                    <Check size={14} />
                  </button>
                  <button type="button" onClick={() => setTitleEditing(false)}>
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-1 justify-center">
                  {profile.professional_title || "Specialized Contractor"}
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTitleDraft(profile.professional_title ?? "");
                        setTitleEditing(true);
                      }}
                      className="text-slate-300 hover:text-slate-500"
                      aria-label="Edit title"
                    >
                      <Edit size={12} />
                    </button>
                  ) : null}
                </p>
              )}
            </div>

            <div className="flex justify-center items-center gap-2">
              {profile.is_top_rated ? (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-[#006e2f] bg-[#ebfdf2] border border-[#006e2f]/20 uppercase">
                  Top Rated
                </span>
              ) : null}
              {profile.is_remote ? (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200">
                  Remote
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => isOwner && setRateModalOpen(true)}
              className={`grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 w-full text-left ${
                isOwner ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
            >
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <DollarSign size={10} />
                  <span>Rate</span>
                  {isOwner ? <Edit size={10} className="ml-auto" /> : null}
                </div>
                <p className="text-sm font-extrabold text-slate-800">
                  {formatMoney(
                    profile.hourly_rate ?? 0,
                    profile.salary_currency ?? "PHP",
                    { perHour: true }
                  )}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <Clock size={10} />
                  <span>Avail.</span>
                </div>
                <p className="text-sm font-extrabold text-slate-800">
                  {profile.availability || "Full-time"}
                </p>
              </div>
            </button>

            <div className="space-y-3.5 pt-2 border-t border-slate-100 text-left text-xs font-bold text-slate-600">
              <InlineEditableRow
                label="Location"
                value={profile.location ?? ""}
                editable={isOwner}
                onSave={(v) => saveProfileField({ location: v })}
              />
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Member Since</span>
                <span className="text-slate-800">{memberSince}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-slate-400 shrink-0">Age</span>
                {birthYearEditing ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={birthYearDraft}
                      onChange={(e) => setBirthYearDraft(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                    >
                      <option value="">Not specified</option>
                      {BIRTH_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={saveBirthYear} className="text-[#006e2f]">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setBirthYearEditing(false)}>
                      <X size={14} className="text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <span>{ageString}</span>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => {
                          setBirthYearDraft(
                            profile.birth_year ? String(profile.birth_year) : ""
                          );
                          setBirthYearEditing(true);
                        }}
                        className="text-slate-300 hover:text-slate-500"
                        aria-label="Edit birth year"
                      >
                        <Edit size={12} />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
              <InlineEditableRow
                label="Portfolio"
                value={profile.portfolio_url ?? ""}
                inputType="url"
                editable={isOwner}
                displayValue={
                  profile.portfolio_url ? "View link" : undefined
                }
                onSave={(v) => saveProfileField({ portfolioUrl: v })}
              />
              {isOwner ? (
                <>
                  <InlineEditableRow
                    label="Resume"
                    value={profile.resume_url ?? ""}
                    inputType="url"
                    editable
                    displayValue={
                      profile.resume_url ? "Link set" : undefined
                    }
                    onSave={(v) => saveProfileField({ resumeUrl: v })}
                  />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Resume</span>
                    {profile.resume_url ? (
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#006e2f] hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-400">Not specified</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 pt-4">
              {!isOwner ? (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl"
                >
                  Message Candidate
                </button>
              ) : null}
              <button
                type="button"
                onClick={shareProfile}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
              >
                <Share2 size={14} className="text-slate-400" />
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOwner ? (
        <>
          <RateAvailabilityModal
            open={rateModalOpen}
            onClose={() => setRateModalOpen(false)}
            initial={{
              availability: profile.availability ?? "Full-time",
              hourlyRate: Number(profile.hourly_rate ?? 0),
              isRemote: Boolean(profile.is_remote),
              salaryCurrency: profile.salary_currency ?? "PHP",
            }}
            onSaved={(data) =>
              setProfile((prev) => ({
                ...prev,
                availability: data.availability,
                hourly_rate: data.hourlyRate,
                is_remote: data.isRemote,
                salary_currency: data.salaryCurrency,
              }))
            }
          />
          <SkillsManageModal
            open={skillsModalOpen}
            onClose={() => setSkillsModalOpen(false)}
            skills={skills}
            onSkillsChange={setSkills}
          />
          <ProjectFormModal
            open={projectModalOpen}
            onClose={() => {
              setProjectModalOpen(false);
              setEditingProject(null);
            }}
            project={editingProject}
            onSaved={(saved) => {
              setProjects((prev) => {
                const exists = prev.some((p) => p.id === saved.id);
                if (exists) {
                  return prev.map((p) => (p.id === saved.id ? saved : p));
                }
                return [saved, ...prev];
              });
            }}
          />
          <ConfirmDialog
            open={Boolean(deleteProjectId)}
            title="Remove project?"
            description="This project will be removed from your public profile."
            confirmLabel="Remove"
            variant="danger"
            onConfirm={confirmDeleteProject}
            onCancel={() => setDeleteProjectId(null)}
          />
        </>
      ) : null}
    </div>
  );
}
