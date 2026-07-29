"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  removeAdminAvatar,
  updateAdminSelfProfile,
  uploadAdminAvatar,
  type AdminSelfProfile,
} from "@/actions/admin/profile";
import { ProfileAvatarUpload } from "@/components/shared/ProfileAvatarUpload";
import { AccountLoginIdentity } from "@/components/shared/settings/AccountLoginIdentity";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Button } from "@/components/ui/button";
import { profileImageHelperText } from "@/lib/storage/profile-image";
import {
  formatTimeZoneLabel,
  listTimeZones,
} from "@/lib/admin/timezones";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

interface AdminPersonalProfileCardProps {
  profile: AdminSelfProfile;
}

function resolveDisplayName(profile: AdminSelfProfile): string {
  const full = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return (
    profile.displayName?.trim() ||
    full ||
    profile.email ||
    "Admin"
  );
}

export function AdminPersonalProfileCard({
  profile,
}: AdminPersonalProfileCardProps) {
  const router = useRouter();
  const timeZones = useMemo(() => listTimeZones(), []);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [department, setDepartment] = useState(profile.department ?? "");
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "Asia/Manila");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [directoryPublic, setDirectoryPublic] = useState(profile.directoryPublic);

  const name = resolveDisplayName(profile);
  const roleLabel =
    profile.adminRole === "superadmin" ? "Super admin" : "Moderator";

  const openEdit = () => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setDepartment(profile.department ?? "");
    setDisplayName(profile.displayName ?? "");
    setTimezone(profile.timezone ?? "Asia/Manila");
    setBio(profile.bio ?? "");
    setDirectoryPublic(profile.directoryPublic);
    setEditOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateAdminSelfProfile({
        firstName,
        lastName,
        department,
        displayName,
        timezone,
        bio,
        directoryPublic,
      });
      if (result.success) {
        toast.success("Profile updated");
        setEditOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-4 border-b border-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">Profile</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Your work identity. Crop your photo, set timezone and bio, and
              choose whether to appear on the public team page.
            </p>
          </div>
          <button
            type="button"
            onClick={openEdit}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#006e2f] transition-colors hover:border-[#006e2f]/30 hover:bg-[#ebfdf2]/50 sm:w-auto sm:min-h-0 sm:py-2.5"
          >
            <Edit size={14} aria-hidden />
            Edit details
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <ProfileAvatarUpload
            avatarUrl={profile.avatarUrl}
            displayName={name}
            size="md"
            helperText={`${profileImageHelperText()} You can crop before uploading.`}
            uploadAction={uploadAdminAvatar}
            removeAction={removeAdminAvatar}
            onAvatarChange={() => router.refresh()}
          />

          <AccountLoginIdentity email={profile.email} />

          <div className="border-t border-slate-50 pt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact details
            </h3>
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {name}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Department
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {profile.department || "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {roleLabel}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Timezone
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {profile.timezone
                    ? formatTimeZoneLabel(profile.timezone)
                    : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Public directory
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {profile.directoryPublic ? "Listed on /team" : "Hidden"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-slate-50 pt-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Bio
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {profile.bio?.trim() || "No bio yet."}
            </p>
            {profile.directoryPublic ? (
              <Link
                href="/team"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-[#006e2f] hover:underline"
              >
                View public team page
                <ExternalLink size={12} aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <AdminDrawer
        open={editOpen}
        onClose={() => {
          if (!pending) setEditOpen(false);
        }}
        title="Edit profile details"
        description="Update how you appear to other admins — and optionally on /team."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="!w-auto min-h-11"
              disabled={pending}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-profile-edit-form"
              className="!w-auto min-h-11 gap-2"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Save
            </Button>
          </div>
        }
      >
        <form
          id="admin-profile-edit-form"
          onSubmit={handleSave}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                First name
              </label>
              <input
                className={inputClassName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                disabled={pending}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Last name
              </label>
              <input
                className={inputClassName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                disabled={pending}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Display name
            </label>
            <input
              className={inputClassName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Optional — defaults to full name"
              disabled={pending}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Department
            </label>
            <input
              className={inputClassName}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Trust & Safety"
              disabled={pending}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Timezone
            </label>
            <select
              className={inputClassName}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={pending}
            >
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {formatTimeZoneLabel(zone)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Bio
            </label>
            <textarea
              className={`${inputClassName} min-h-[120px] resize-y py-3`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              placeholder="Short intro for teammates and (if listed) the public team page"
              disabled={pending}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              {bio.length}/500
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#006e2f] focus:ring-[#22c55e]/40"
              checked={directoryPublic}
              onChange={(e) => setDirectoryPublic(e.target.checked)}
              disabled={pending}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">
                Show on public team page
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                Publishes your name, photo, department, timezone, and bio on{" "}
                <span className="font-semibold">/team</span>. Email stays
                private.
              </span>
            </span>
          </label>
        </form>
      </AdminDrawer>
    </>
  );
}
