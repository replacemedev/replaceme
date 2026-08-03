"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import {
  AdminDataTable,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  AdminMobileCard,
} from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  listEmailEvents,
  listEmailMessages,
  type AdminEmailMessageRow,
  type AdminEmailEventRow,
} from "@/actions/admin/email-management";
import {
  createAndSendBroadcast,
  previewBroadcastHtml,
} from "@/actions/admin/email-broadcasts";
import {
  listEmailTemplates,
  previewEmailTemplate,
  setEmailTemplateEnabled,
  setScaleEarlyAccessEnabled,
  type AdminEmailTemplateRow,
} from "@/actions/admin/email-templates";
import {
  listProductAnnouncements,
  upsertProductAnnouncement,
  type ProductAnnouncementRow,
} from "@/actions/admin/announcements";
import { AdminSlideover } from "@/components/admin/shared/AdminSlideover";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmailRowActionsMenu } from "@/components/admin/reports/email/EmailRowActionsMenu";

const STATUS_FILTERS = [
  "all",
  "queued",
  "scheduled",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "delayed",
  "bounced",
  "complained",
  "suppressed",
  "failed",
] as const;

const KIND_FILTERS = ["all", "transactional", "broadcast"] as const;

const SEGMENT_OPTIONS = [
  { key: "role_employer", label: "Employers" },
  { key: "role_worker", label: "Workers" },
  { key: "role_admin", label: "Admins (requires segment)" },
  { key: "tier_discovery", label: "Discovery (requires segment)" },
  { key: "tier_starter", label: "Starter (requires segment)" },
  { key: "tier_growth", label: "Growth (requires segment)" },
  { key: "tier_scale", label: "Scale (requires segment)" },
] as const;

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function AdminEmailManagementInner({
  initial,
  isSuperAdmin,
  broadcastReady,
  scaleEarlyAccess,
  initialTemplates,
  initialAnnouncements,
}: {
  initial: AdminEmailMessageRow[];
  isSuperAdmin: boolean;
  broadcastReady: boolean;
  scaleEarlyAccess: boolean;
  initialTemplates: AdminEmailTemplateRow[];
  initialAnnouncements: ProductAnnouncementRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "broadcasts";

  const initialKindParam = searchParams.get("kind");
  const initialKind =
    initialKindParam && KIND_FILTERS.includes(initialKindParam as never)
      ? (initialKindParam as (typeof KIND_FILTERS)[number])
      : "all";

  const initialStatusParam = searchParams.get("status");
  const initialStatus =
    initialStatusParam && STATUS_FILTERS.includes(initialStatusParam as never)
      ? (initialStatusParam as (typeof STATUS_FILTERS)[number])
      : "all";

  const [pending, startTransition] = useTransition();
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]>(initialStatus);
  const [kind, setKind] =
    useState<(typeof KIND_FILTERS)[number]>(initialKind);
  const [rows, setRows] = useState(initial);
  const [templates, setTemplates] = useState(initialTemplates);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [eaEnabled, setEaEnabled] = useState(scaleEarlyAccess);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<AdminEmailEventRow[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("Preview");

  const [segmentKey, setSegmentKey] = useState<(typeof SEGMENT_OPTIONS)[number]["key"]>(
    "role_employer"
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [advancedHtml, setAdvancedHtml] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [annForm, setAnnForm] = useState({
    featureKey: "",
    title: "",
    summary: "",
    teaserTitle: "",
    teaserSummary: "",
    ctaLabel: "",
    ctaHref: "",
    enabled: true,
    requiresEarlyAccess: true,
    status: "draft" as "draft" | "published" | "archived",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState(`${status}:${kind}`);
  const filterKey = `${status}:${kind}`;
  if (filterKey !== prevFilters) {
    setPrevFilters(filterKey);
    setCurrentPage(1);
  }

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  useEffect(() => {
    const k = searchParams.get("kind");
    const s = searchParams.get("status");
    const validKind =
      k && KIND_FILTERS.includes(k as never)
        ? (k as (typeof KIND_FILTERS)[number])
        : "all";
    const validStatus =
      s && STATUS_FILTERS.includes(s as never)
        ? (s as (typeof STATUS_FILTERS)[number])
        : "all";

    setKind(validKind);
    setStatus(validStatus);
  }, [searchParams]);

  const updateFilters = (
    nextKind: (typeof KIND_FILTERS)[number],
    nextStatus: (typeof STATUS_FILTERS)[number]
  ) => {
    setKind(nextKind);
    setStatus(nextStatus);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (nextKind === "all") {
      params.delete("kind");
    } else {
      params.set("kind", nextKind);
    }

    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }

    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname);

    startTransition(async () => {
      try {
        const next = await listEmailMessages({
          limit: 50,
          status: nextStatus === "all" ? undefined : (nextStatus as never),
          kind: nextKind === "all" ? undefined : nextKind,
        });
        setRows(next.messages);
      } catch {
        toast.error("Failed to filter email reports");
      }
    });
  };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of STATUS_FILTERS) map.set(f, 0);
    map.set("all", rows.length);
    for (const r of rows) {
      map.set(r.status, (map.get(r.status) ?? 0) + 1);
    }
    return Object.fromEntries(map.entries());
  }, [rows]);

  const refresh = () => {
    startTransition(async () => {
      try {
        const next = await listEmailMessages({
          limit: 50,
          status: status === "all" ? undefined : (status as never),
          kind: kind === "all" ? undefined : kind,
        });
        setRows(next.messages);
        router.refresh();
        toast.success("Email reports refreshed");
      } catch {
        toast.error("Failed to refresh email reports");
      }
    });
  };

  const openRow = (id: string) => {
    setSelectedId(id);
    setEvents([]);
    startTransition(async () => {
      const next = await listEmailEvents(id);
      setEvents(next.events);
    });
  };

  const sendBroadcast = () => {
    startTransition(async () => {
      const result = await createAndSendBroadcast({
        segmentKey: segmentKey as never,
        subject,
        body: showAdvanced ? undefined : body,
        html: showAdvanced ? advancedHtml : undefined,
        ctaLabel: ctaLabel || undefined,
        ctaUrl: ctaUrl || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Broadcast sent");
      setSubject("");
      setBody("");
      setAdvancedHtml("");
      refresh();
    });
  };

  const runPreview = () => {
    startTransition(async () => {
      if (showAdvanced) {
        setPreviewTitle(subject || "HTML preview");
        setPreviewHtml(advancedHtml);
        return;
      }
      const result = await previewBroadcastHtml({
        subject,
        body,
        ctaLabel: ctaLabel || undefined,
        ctaUrl: ctaUrl || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreviewTitle(subject || "Broadcast preview");
      setPreviewHtml(result.html);
    });
  };

  const itemsPerPage = 20;
  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedRows = useMemo(
    () => rows.slice(startIndex, startIndex + itemsPerPage),
    [rows, startIndex]
  );

  return (
    <div className="space-y-6">
      <AdminTabs
        tabs={[
          { id: "broadcasts", label: "Broadcasts" },
          { id: "templates", label: "Templates (Transactional)" },
          { id: "announcements", label: "Announcements" },
        ]}
      />

      {tab === "broadcasts" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              broadcastReady
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                : "border-amber-200 bg-amber-50/80 text-amber-950"
            }`}
          >
            {broadcastReady ? (
              <p className="font-semibold">
                Compliance ready: Unsubscribe link and physical address will be injected.
              </p>
            ) : (
              <p className="font-semibold">
                Broadcasts blocked until{" "}
                <code className="rounded bg-white/70 px-1">COMPANY_PHYSICAL_ADDRESS</code>{" "}
                is set (CAN-SPAM). In-app announcements still work.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold text-slate-900">Broadcast composer</p>
              <p className="text-sm text-slate-500">
                Modular Replaceme template with required unsubscribe + postal footer.
              </p>
            </div>
            {!isSuperAdmin ? (
              <p className="text-sm font-semibold text-slate-400">Super admin required</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={runPreview}
                  disabled={pending}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={sendBroadcast}
                  disabled={
                    pending ||
                    !broadcastReady ||
                    subject.trim().length < 3 ||
                    (showAdvanced
                      ? advancedHtml.trim().length < 30
                      : body.trim().length < 10)
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a4a29] transition-colors disabled:opacity-50"
                >
                  Send broadcast
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-12">
            <label className="lg:col-span-4">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Segment
              </span>
              <select
                value={segmentKey}
                onChange={(e) => setSegmentKey(e.target.value as never)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800"
                disabled={!isSuperAdmin || pending}
              >
                {SEGMENT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="lg:col-span-8">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800"
                placeholder="e.g. Early Access: hiring insights"
                disabled={!isSuperAdmin || pending}
              />
            </label>
            {!showAdvanced ? (
              <>
                <label className="lg:col-span-12">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message
                  </span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-1 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
                    placeholder="Write your update (plain text; blank lines become paragraphs)…"
                    disabled={!isSuperAdmin || pending}
                  />
                </label>
                <label className="lg:col-span-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CTA label
                  </span>
                  <input
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800"
                    disabled={!isSuperAdmin || pending}
                    placeholder="Open dashboard"
                  />
                </label>
                <label className="lg:col-span-8">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CTA URL
                  </span>
                  <input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800"
                    disabled={!isSuperAdmin || pending}
                    placeholder="https://replaceme.ph/employer/dashboard"
                  />
                </label>
              </>
            ) : (
              <label className="lg:col-span-12">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Advanced HTML
                </span>
                <textarea
                  value={advancedHtml}
                  onChange={(e) => setAdvancedHtml(e.target.value)}
                  className="mt-1 min-h-[160px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs text-slate-800"
                  disabled={!isSuperAdmin || pending}
                  placeholder="Must include {{{RESEND_UNSUBSCRIBE_URL}}} and the physical address"
                />
              </label>
            )}
          </div>
          {isSuperAdmin ? (
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Use modular template" : "Advanced HTML"}
            </button>
          ) : null}
        </section>
      ) : null}

      {tab === "templates" ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-sm font-bold text-slate-900">Transactional templates</p>
            <p className="mt-1 text-sm text-slate-500">
              Preview system emails and toggle non-critical templates. Auth mail cannot be disabled.
            </p>
          </div>
          <AdminDataTable
            mobileCards={templates.map((t) => (
              <AdminMobileCard
                key={t.key}
                actionsPlacement="header"
                actions={
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await previewEmailTemplate(t.key);
                        if (!result.success) {
                          toast.error(result.error);
                          return;
                        }
                        setPreviewTitle(result.subject);
                        setPreviewHtml(result.html);
                      });
                    }}
                  >
                    Preview
                  </button>
                }
              >
                <p className="text-sm font-bold text-slate-900">{t.name}</p>
                <p className="mt-1 text-xs text-slate-500">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <StatusBadge status={t.enabled ? "delivered" : "failed"} />
                  <span className="text-slate-400">{t.category}</span>
                </div>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-[840px] text-sm">
              <thead className={ADMIN_TABLE_HEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>Template</th>
                  <th className={ADMIN_TABLE_TH}>Category</th>
                  <th className={ADMIN_TABLE_TH}>Status</th>
                  <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {templates.map((t) => (
                  <tr key={t.key} className={ADMIN_TABLE_ROW}>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <p className="truncate font-semibold text-slate-900">{t.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{t.key}</p>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="text-xs font-semibold text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <StatusBadge status={t.enabled ? "delivered" : "suppressed"} />
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-right`}>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                          onClick={() => {
                            startTransition(async () => {
                              const result = await previewEmailTemplate(t.key);
                              if (!result.success) {
                                toast.error(result.error);
                                return;
                              }
                              setPreviewTitle(result.subject);
                              setPreviewHtml(result.html);
                            });
                          }}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          disabled={!isSuperAdmin || t.critical || pending}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"
                          onClick={() => {
                            startTransition(async () => {
                              const result = await setEmailTemplateEnabled({
                                templateKey: t.key,
                                enabled: !t.enabled,
                              });
                              if (!result.success) {
                                toast.error(result.error);
                                return;
                              }
                              const next = await listEmailTemplates();
                              setTemplates(next.templates);
                              toast.success(
                                t.enabled ? "Template disabled" : "Template enabled"
                              );
                            });
                          }}
                        >
                          {t.critical ? "Locked" : t.enabled ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>
        </section>
      ) : null}

      {tab === "announcements" ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  Early Access to New Features (Scale)
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  When off, even Scale cannot use gated features. Other plans never can.
                </p>
              </div>
              <button
                type="button"
                disabled={!isSuperAdmin || pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await setScaleEarlyAccessEnabled(!eaEnabled);
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    setEaEnabled(!eaEnabled);
                    toast.success(
                      !eaEnabled ? "Early Access enabled" : "Early Access paused"
                    );
                  });
                }}
                className={`inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${
                  eaEnabled ? "bg-[#006e2f] hover:bg-[#0a4a29]" : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {eaEnabled ? "On: Scale can try features" : "Off: Early Access paused"}
              </button>
            </div>
          </div>

          {isSuperAdmin ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-sm font-bold text-slate-900">New announcement</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-12">
                <label className="lg:col-span-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Feature key
                  </span>
                  <input
                    value={annForm.featureKey}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, featureKey: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                    placeholder="hiring_insights_v1"
                  />
                </label>
                <label className="lg:col-span-8">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scale title
                  </span>
                  <input
                    value={annForm.title}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                  />
                </label>
                <label className="lg:col-span-12">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scale summary
                  </span>
                  <textarea
                    value={annForm.summary}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, summary: e.target.value }))
                    }
                    className="mt-1 min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="lg:col-span-6">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teaser title (other plans)
                  </span>
                  <input
                    value={annForm.teaserTitle}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, teaserTitle: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                    placeholder="Coming soon on Scale"
                  />
                </label>
                <label className="lg:col-span-6">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teaser summary
                  </span>
                  <input
                    value={annForm.teaserSummary}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, teaserSummary: e.target.value }))
                    }
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                  />
                </label>
                <label className="lg:col-span-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CTA label
                  </span>
                  <input
                    value={annForm.ctaLabel}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, ctaLabel: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                  />
                </label>
                <label className="lg:col-span-5">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CTA href
                  </span>
                  <input
                    value={annForm.ctaHref}
                    onChange={(e) =>
                      setAnnForm((f) => ({ ...f, ctaHref: e.target.value }))
                    }
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                    placeholder="/employer/dashboard"
                  />
                </label>
                <label className="lg:col-span-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </span>
                  <select
                    value={annForm.status}
                    onChange={(e) =>
                      setAnnForm((f) => ({
                        ...f,
                        status: e.target.value as typeof f.status,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <div className="flex flex-wrap items-center gap-4 lg:col-span-12">
                  <label className="flex items-center gap-3 text-sm font-semibold leading-snug text-slate-700">
                    <Checkbox
                      checked={annForm.enabled}
                      onChange={(e) =>
                        setAnnForm((f) => ({ ...f, enabled: e.target.checked }))
                      }
                      className="shrink-0"
                    />
                    Feature enabled
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold leading-snug text-slate-700">
                    <Checkbox
                      checked={annForm.requiresEarlyAccess}
                      onChange={(e) =>
                        setAnnForm((f) => ({
                          ...f,
                          requiresEarlyAccess: e.target.checked,
                        }))
                      }
                      className="shrink-0"
                    />
                    Requires Early Access
                  </label>
                  <button
                    type="button"
                    disabled={pending}
                    className="ml-auto rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a4a29] transition-colors disabled:opacity-50"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await upsertProductAnnouncement({
                          featureKey: annForm.featureKey,
                          title: annForm.title,
                          summary: annForm.summary,
                          teaserTitle: annForm.teaserTitle || null,
                          teaserSummary: annForm.teaserSummary || null,
                          ctaLabel: annForm.ctaLabel || null,
                          ctaHref: annForm.ctaHref || null,
                          status: annForm.status,
                          enabled: annForm.enabled,
                          requiresEarlyAccess: annForm.requiresEarlyAccess,
                        });
                        if (!result.success) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success("Announcement saved");
                        const next = await listProductAnnouncements();
                        setAnnouncements(next.announcements);
                      });
                    }}
                  >
                    Save announcement
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <AdminDataTable
            mobileCards={announcements.map((a) => (
              <AdminMobileCard key={a.id}>
                <p className="truncate text-sm font-bold text-slate-900">{a.title}</p>
                <p className="mt-1 text-xs text-slate-500">{a.feature_key}</p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge status={a.status === "published" ? "sent" : "queued"} />
                  <span className="text-xs text-slate-400">
                    {a.enabled ? "enabled" : "off"}
                  </span>
                </div>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-[840px] text-sm">
              <thead className={ADMIN_TABLE_HEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>Announcement</th>
                  <th className={ADMIN_TABLE_TH}>Status</th>
                  <th className={ADMIN_TABLE_TH}>Gates</th>
                  <th className={ADMIN_TABLE_TH}>Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {announcements.map((a) => (
                  <tr key={a.id} className={ADMIN_TABLE_ROW}>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <p className="truncate font-semibold text-slate-900">{a.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {a.feature_key}
                      </p>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <StatusBadge
                        status={
                          a.status === "published"
                            ? "sent"
                            : a.status === "archived"
                              ? "suppressed"
                              : "queued"
                        }
                      />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="text-xs text-slate-600">
                        {a.enabled ? "on" : "off"}
                        {a.requires_early_access ? " · EA" : ""}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {formatWhen(a.updated_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>
        </section>
      ) : null}

      {tab === "broadcasts" ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <AdminFilterPills
                options={KIND_FILTERS.map((k) =>
                  k === "all" ? "All kinds" : k
                )}
                value={kind === "all" ? "All kinds" : kind}
                onChange={(v) => {
                  const selectedKind =
                    v === "All kinds" ? "all" : (v as typeof kind);
                  updateFilters(selectedKind, status);
                }}
              />
              <AdminFilterPills
                options={STATUS_FILTERS.map((s) => (s === "all" ? "All" : s))}
                value={status === "all" ? "All" : status}
                onChange={(v) => {
                  const selectedStatus =
                    v === "All" ? "all" : (v as typeof status);
                  updateFilters(kind, selectedStatus);
                }}
                counts={Object.fromEntries(
                  STATUS_FILTERS.map((s) => [
                    s === "all" ? "All" : s,
                    (counts as Record<string, number>)[s] ?? 0,
                  ])
                )}
              />
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={pending}
              className="shrink-0 rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a4a29] transition-colors disabled:opacity-50"
            >
              {pending ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <AdminDataTable
            mobileCards={paginatedRows.map((row) => (
              <AdminMobileCard
                key={row.id}
                actionsPlacement="header"
                actions={
                  <EmailRowActionsMenu
                    row={row}
                    onViewEvents={() => openRow(row.id)}
                    onDuplicateBroadcast={(s) => {
                      setSubject(s);
                      setShowAdvanced(false);
                    }}
                  />
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {row.subject ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 capitalize">
                      {row.kind} · {row.to_email ?? "Broadcast"}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-xs text-slate-400">
                  {formatWhen(row.last_event_at ?? row.created_at)}
                </p>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-[960px] text-sm">
              <thead className={ADMIN_TABLE_HEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>Subject</th>
                  <th className={ADMIN_TABLE_TH}>Kind</th>
                  <th className={ADMIN_TABLE_TH}>Recipient</th>
                  <th className={ADMIN_TABLE_TH}>Status</th>
                  <th className={ADMIN_TABLE_TH}>Last event</th>
                  <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm font-medium text-slate-500"
                    >
                      No email reports found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr key={row.id} className={ADMIN_TABLE_ROW}>
                      <td className={`${ADMIN_TABLE_TD} min-w-0 max-w-[280px]`}>
                        <p className="truncate font-semibold text-slate-900">
                          {row.subject ?? "—"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {row.provider_message_id ??
                            row.provider_broadcast_id ??
                            "—"}
                        </p>
                      </td>
                      <td className={`${ADMIN_TABLE_TD} whitespace-nowrap`}>
                        <span className="text-xs font-semibold text-slate-700 capitalize whitespace-nowrap">
                          {row.kind}
                        </span>
                      </td>
                      <td className={`${ADMIN_TABLE_TD} min-w-0 whitespace-nowrap`}>
                        <span className="block truncate text-xs text-slate-600">
                          {row.to_email ?? "Broadcast"}
                        </span>
                      </td>
                      <td className={`${ADMIN_TABLE_TD} whitespace-nowrap`}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={`${ADMIN_TABLE_TD} whitespace-nowrap`}>
                        <span className="whitespace-nowrap text-xs text-slate-500">
                          {formatWhen(row.last_event_at ?? row.created_at)}
                        </span>
                      </td>
                      <td className={`${ADMIN_TABLE_TD} text-right whitespace-nowrap`}>
                        <EmailRowActionsMenu
                          row={row}
                          onViewEvents={() => openRow(row.id)}
                          onDuplicateBroadcast={(s) => {
                            setSubject(s);
                            setShowAdvanced(false);
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminDataTable>
          <TablePagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </section>
      ) : null}

      <AdminSlideover
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="Email events"
        description="Webhook-delivered delivery outcomes from Resend."
      >
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {e.event_type}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatWhen(e.occurred_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminSlideover>

      <AdminSlideover
        open={previewHtml !== null}
        onClose={() => setPreviewHtml(null)}
        title={previewTitle}
        description="Rendered email preview"
      >
        {previewHtml ? (
          <iframe
            title="Email preview"
            className="h-[70vh] w-full rounded-xl border border-slate-200 bg-white"
            srcDoc={previewHtml}
            sandbox=""
          />
        ) : null}
      </AdminSlideover>
    </div>
  );
}

export function AdminEmailManagementClient(
  props: Parameters<typeof AdminEmailManagementInner>[0]
) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <AdminEmailManagementInner {...props} />
    </Suspense>
  );
}
