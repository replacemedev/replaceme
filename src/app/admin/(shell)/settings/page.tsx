import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Shield,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  ADMIN_ACCENT_SOFT,
  ADMIN_CARD,
  ADMIN_CARD_HOVER,
} from "@/lib/admin/ui-tokens";
import { hasCapability, type AdminCapability } from "@/lib/admin/capabilities";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Settings | Admin",
};

export const dynamic = "force-dynamic";

const SETTINGS_SECTIONS = [
  {
    href: "/admin/settings/profile",
    label: "My profile",
    description: "Photo, bio, timezone, password, and public directory opt-in.",
    icon: User,
    superAdminOnly: false,
  },
  {
    href: "/admin/settings/directory",
    label: "Staff directory",
    description: "Browse active teammates. Public /team is opt-in only.",
    icon: Users,
    superAdminOnly: false,
  },
  {
    href: "/admin/settings/team",
    label: "Admin Team",
    description: "Invite moderators, grant module access, and manage team accounts.",
    icon: UserCog,
    superAdminOnly: true,
  },
] as const;

const RELATED_OPS: ReadonlyArray<{
  href: string;
  label: string;
  description: string;
  icon: typeof Shield;
  capability: AdminCapability;
}> = [
  {
    href: "/admin/security",
    label: "Security Center",
    description: "MFA enrollment, sessions, and admin security posture.",
    icon: Shield,
    capability: "security",
  },
  {
    href: "/admin/billing",
    label: "Billing",
    description: "Stripe subscriptions, ledger events, and plan ops.",
    icon: CreditCard,
    capability: "billing",
  },
  {
    href: "/admin/identity",
    label: "Identity review",
    description: "Worker ID verification queue and company trust signals.",
    icon: BadgeCheck,
    capability: "identity",
  },
];

export default async function AdminSettingsPage() {
  await requireAdminPageCapability("settings");

  const { isSuperAdmin, capabilities } = await getCurrentAdminCapabilities();
  const env = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured";
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  const sections = SETTINGS_SECTIONS.filter(
    (section) => !section.superAdminOnly || isSuperAdmin
  );

  const related = RELATED_OPS.filter(
    (item) => isSuperAdmin || hasCapability(capabilities, item.capability)
  );

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Settings"
        description="Your admin account, staff directory, and team access. Related ops live one click away."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group flex min-h-[5.5rem] items-start gap-4 p-5 ${ADMIN_CARD} ${ADMIN_CARD_HOVER} hover:border-emerald-200/80 hover:bg-[#fafdfb]`}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#006e2f]"
                style={{ backgroundColor: ADMIN_ACCENT_SOFT }}
              >
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
                <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                  {section.description}
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      {related.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Related ops
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex min-h-11 items-start gap-3 p-4 ${ADMIN_CARD} ${ADMIN_CARD_HOVER}`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-[#ebfdf2] group-hover:text-[#006e2f]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </span>
                      <ChevronRight
                        className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#006e2f]"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className={`${ADMIN_CARD} divide-y divide-slate-100 overflow-hidden`}>
        <div className="px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Status</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live readiness signals for this admin session.
          </p>
        </div>
        <SettingsRow
          label="Admin tier"
          value={isSuperAdmin ? "Super admin" : "Moderator"}
        />
        <SettingsRow
          label="Stripe"
          value={stripeConfigured ? "Configured" : "Not configured"}
          tone={stripeConfigured ? "ok" : "warn"}
        />
        <SettingsRow
          label="MFA policy"
          value="TOTP required · AAL2 for admin shell"
        />
        <SettingsRow label="Environment" value={env} />
        {isSuperAdmin ? (
          <SettingsRow label="Supabase project" value={supabaseUrl} mono />
        ) : null}
      </section>
    </AdminPageShell>
  );
}

function SettingsRow({
  label,
  value,
  mono = false,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="flex min-h-11 flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-sm font-medium text-slate-600">{label}</span>
      <span
        className={`min-w-0 text-sm text-slate-900 ${
          mono
            ? "break-all font-mono text-xs [overflow-wrap:anywhere]"
            : "font-semibold sm:text-right"
        } ${
          tone === "ok"
            ? "text-[#006e2f]"
            : tone === "warn"
              ? "text-amber-700"
              : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
