import { Settings } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

export const metadata = {
  title: "Settings | Admin",
};

export default function AdminSettingsPage() {
  const env = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured";
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Settings"
        description="Read-only environment configuration for the admin panel."
      />

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] divide-y divide-slate-100">
        <SettingsRow label="Environment" value={env} />
        <SettingsRow label="Supabase project" value={supabaseUrl} mono />
        <SettingsRow
          label="Stripe integration"
          value={stripeConfigured ? "Configured" : "Not configured"}
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
            Public marketing and legal copy is editable under{" "}
            <a href="/admin/settings/pages" className="text-emerald-600 font-semibold hover:underline">
              Public Pages
            </a>
            .
          </p>
        </div>
      </div>
    </div>
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
