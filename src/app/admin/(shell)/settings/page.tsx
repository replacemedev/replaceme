import Link from "next/link";
import { ChevronRight, FileText, Settings, Shield, UserCog } from "lucide-react";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminSelfPasswordActions } from "@/components/admin/settings/AdminSelfPasswordActions";
import { isCurrentUserSuperAdmin } from "@/lib/server/auth/require-super-admin";

export const metadata = {
  title: "Settings | Admin",
};

export const dynamic = "force-dynamic";

const SETTINGS_SECTIONS = [
  {
    href: "/admin/settings/team",
    label: "Admin Team",
    description: "Create, suspend, and manage internal admin accounts.",
    icon: UserCog,
    superAdminOnly: true,
  },
  {
    href: "/admin/settings/pages",
    label: "Public Pages",
    description: "Edit marketing copy, legal pages, and FAQ content.",
    icon: FileText,
    superAdminOnly: false,
  },
] as const;

export default async function AdminSettingsPage() {
  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const env = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured";
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  const sections = SETTINGS_SECTIONS.filter(
    (section) => !section.superAdminOnly || isSuperAdmin
  );

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Platform Settings"
        description="Configuration, admin team management, and editable public content."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {section.label}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#006e2f]"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {section.description}
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Account security</p>
              <p className="mt-1 text-sm text-slate-500">
                Update your password now or receive a reset link by email.
              </p>
            </div>
            <AdminSelfPasswordActions variant="card" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] divide-y divide-slate-100">
        <SettingsRow label="Environment" value={env} />
        <SettingsRow label="Supabase project" value={supabaseUrl} mono />
        <SettingsRow
          label="Stripe integration"
          value={stripeConfigured ? "Configured" : "Not configured"}
        />
        <SettingsRow
          label="Admin tier"
          value={isSuperAdmin ? "Super admin" : "Moderator"}
        />
        <SettingsRow label="Admin auth" value="JWT app_metadata.role = admin" />
        <SettingsRow label="MFA policy" value="AAL2 required in admin shell" />
      </section>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-start gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <Settings className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Global configuration
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Platform-wide settings (billing plans, moderation rules, feature
            flags) are managed via database migrations and environment variables.
          </p>
        </div>
      </div>
    </AdminPageShell>
  );
}

function SettingsRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-5 py-4">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span
        className={`text-sm text-slate-900 ${mono ? "font-mono text-xs break-all" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}
