"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubscriptionTier, AccountSettings } from "@/types/employer/billing";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import {
  createUpgradeCheckout,
  cancelSubscription,
  createCustomerPortalSession,
  reconcileBillingFromStripe,
} from "@/actions/employer/billing";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, RefreshCw } from "lucide-react";

import Link from "next/link";
import type { EmployerAccountDetails } from "@/actions/employer/account";
import type { EmployerInvoiceRow } from "@/lib/server/stripe/list-invoices";
import { AccountDetailsList } from "@/components/employer/settings/account/AccountDetailsList";
import { EmployerPersonalProfileCard } from "@/components/employer/settings/account/EmployerPersonalProfileCard";
import { ManagePlanGrid } from "@/components/employer/settings/account/ManagePlanGrid";
import { ActivePlanSidebar } from "@/components/employer/settings/account/ActivePlanSidebar";
import { EmployerInvoicesPanel } from "@/components/employer/settings/account/EmployerInvoicesPanel";
import { PlanFeatureChecklist } from "@/components/employer/settings/account/PlanFeatureChecklist";
import { EmployerEmailSupportCard } from "@/components/employer/settings/account/EmployerEmailSupportCard";
import { PlanUsageCard } from "@/components/shared/billing/PlanUsageCard";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";

interface AccountSettingsClientProps {
  initialSettings: AccountSettings;
  planUsage: EmployerPlanUsage | null;
  accountDetails: EmployerAccountDetails | null;
  invoices: EmployerInvoiceRow[];
  invoicesError?: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AccountSettingsClient({
  initialSettings,
  planUsage,
  accountDetails,
  invoices,
  invoicesError,
}: AccountSettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [isUpgrading, startUpgradeTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();
  const [isOpeningPortal, startPortalTransition] = useTransition();
  const [isReconciling, startReconcileTransition] = useTransition();
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = React.useState(false);
  const didAutoReconcile = React.useRef(false);

  React.useEffect(() => {
    if (!checkoutSuccess || didAutoReconcile.current) return;
    didAutoReconcile.current = true;
    startReconcileTransition(async () => {
      const result = await reconcileBillingFromStripe();
      if (result.success) {
        toast.success(
          result.planSlug
            ? `Plan synced: ${result.planSlug}`
            : "Billing synced from Stripe"
        );
        router.refresh();
      }
    });
  }, [checkoutSuccess, router]);

  const handleReconcile = () => {
    startReconcileTransition(async () => {
      const toastId = toast.loading("Syncing plan from Stripe...");
      const result = await reconcileBillingFromStripe();
      if (result.success) {
        toast.success(
          result.planSlug
            ? `Plan is now ${result.planSlug}`
            : "Billing synced",
          { id: toastId }
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Sync failed", { id: toastId });
      }
    });
  };

  const handleUpgrade = (planId: SubscriptionTier) => {
    if (planId === "discovery") {
      handleCancelToDiscovery();
      return;
    }

    startUpgradeTransition(async () => {
      const toastId = toast.loading("Redirecting to Stripe...");
      try {
        const result = await createUpgradeCheckout(planId);
        if (result.error) {
          toast.error(result.error, { id: toastId });
          return;
        }
        if (result.success && result.checkoutUrl) {
          toast.dismiss(toastId);
          window.location.href = result.checkoutUrl;
          return;
        }
        toast.error("Could not open Stripe. Please try again.", {
          id: toastId,
        });
      } catch {
        toast.error("Failed to start Stripe checkout. Please try again.", {
          id: toastId,
        });
      }
    });
  };

  const handleCancelToDiscovery = () => {
    setIsDowngradeModalOpen(true);
  };

  const handleCancel = () => {
    startCancelTransition(async () => {
      const toastId = toast.loading("Opening billing portal...");
      try {
        const result = await cancelSubscription();
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success && result.portalUrl) {
          toast.success("Redirecting to Stripe...", { id: toastId });
          window.location.href = result.portalUrl;
        } else {
          toast.error("Unexpected billing response. Please try again.", {
            id: toastId,
          });
        }
      } catch {
        toast.error("Failed to cancel subscription. Please try again.", {
          id: toastId,
        });
      }
    });
  };

  const handleManageBilling = () => {
    startPortalTransition(async () => {
      const toastId = toast.loading("Opening Stripe billing portal...");
      try {
        const result = await createCustomerPortalSession();
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success && result.portalUrl) {
          window.location.href = result.portalUrl;
        }
      } catch {
        toast.error("Failed to open billing portal.", { id: toastId });
      }
    });
  };

  const scheduled = initialSettings.scheduledPlan;
  const scheduledAt = initialSettings.scheduledEffectiveAt;

  return (
    <div className="space-y-8">
      {checkoutSuccess ? (
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-emerald-200 bg-[#ebfdf2] px-5 py-4"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#006e2f] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#006e2f]">
                Stripe confirmation received
              </p>
              <p className="text-xs text-emerald-900/80 font-medium mt-1">
                Your plan updates after Stripe webhooks sync — usually within a
                minute. Refresh if entitlements still look stale.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReconcile}
              disabled={isReconciling}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-[#006e2f] hover:bg-white transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isReconciling ? "animate-spin" : ""}`}
                aria-hidden
              />
              {isReconciling ? "Syncing…" : "Sync plan from Stripe"}
            </button>
            <Link
              href="/employer/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {scheduled && !checkoutSuccess ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50/50 p-5 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-950">
                {scheduled === "discovery"
                  ? "Moving to Discovery at period end"
                  : `Downgrade to ${TIER_LABELS[scheduled]} scheduled`}
              </p>
              <p className="mt-1 text-xs font-medium text-orange-700/90 leading-relaxed">
                You keep {TIER_LABELS[initialSettings.plan]} until{" "}
                {scheduledAt ? formatDate(scheduledAt) : "the end of this billing period"}
                . Upgrade anytime to cancel this change.
              </p>
            </div>
          </div>
          <Link
            href="#manage-plan"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-orange-900 hover:bg-orange-50"
          >
            Manage plan
          </Link>
        </div>
      ) : null}

      {planUsage ? <PlanUsageCard usage={planUsage} /> : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <p className="text-sm font-bold text-slate-900">Account security</p>
        <p className="mt-1 text-sm text-slate-500">
          Sign out other devices or end every session if you suspect unauthorized access.
        </p>
        <Link
          href="/employer/settings/security"
          className="mt-3 inline-flex text-sm font-bold text-[#006e2f] hover:underline"
        >
          Open security settings →
        </Link>
      </div>

      <PlanFeatureChecklist
        currentPlan={initialSettings.plan}
        planUsage={planUsage}
      />

      <EmployerEmailSupportCard currentPlan={initialSettings.plan} />

      <div className="w-full flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
        <div className="w-full lg:col-span-2 space-y-8">
          {accountDetails ? (
            <EmployerPersonalProfileCard account={accountDetails} />
          ) : null}
          <AccountDetailsList />
          <ManagePlanGrid
            currentPlan={initialSettings.plan}
            isUpgrading={isUpgrading}
            isCancelling={isCancelling}
            onUpgrade={handleUpgrade}
            onCancelToDiscovery={handleCancelToDiscovery}
            onManageBilling={handleManageBilling}
            isOpeningPortal={isOpeningPortal}
            nextBillingDate={initialSettings.nextBillingDate}
            scheduledPlan={initialSettings.scheduledPlan}
            cancelAtPeriodEnd={initialSettings.cancelAtPeriodEnd}
          />
          <EmployerInvoicesPanel
            invoices={invoices}
            error={invoicesError}
          />
        </div>

        <div className="w-full lg:col-span-1 lg:sticky lg:top-24">
          <ActivePlanSidebar
            currentPlan={initialSettings.plan}
            isCancelling={isCancelling}
            cancelAtPeriodEnd={initialSettings.cancelAtPeriodEnd}
            hasStripeSubscription={initialSettings.hasStripeSubscription}
            isOpeningPortal={isOpeningPortal}
            nextBillingDate={initialSettings.nextBillingDate}
            scheduledPlan={initialSettings.scheduledPlan}
            scheduledEffectiveAt={initialSettings.scheduledEffectiveAt}
            onCancel={() => setIsDowngradeModalOpen(true)}
            onManageBilling={handleManageBilling}
          />
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {isDowngradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => {
              if (!isCancelling) setIsDowngradeModalOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden w-full max-w-md mx-auto z-10 flex flex-col">
            {/* Header / Body */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Confirm Plan Downgrade
              </h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                You&apos;ll confirm cancellation on Stripe. You keep your current
                plan&apos;s features until the end of your billing period (per
                Stripe portal settings), then move to the free Discovery tier.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 p-6 bg-slate-50/50 border-t border-slate-100 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsDowngradeModalOpen(false)}
                className="w-full min-h-[44px] sm:min-h-0 sm:w-auto text-slate-600 hover:bg-slate-100 font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="w-full min-h-[44px] sm:min-h-0 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isCancelling ? "Redirecting to Stripe..." : "Continue to Stripe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
