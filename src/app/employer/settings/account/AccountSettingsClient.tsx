"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubscriptionTier, AccountSettings } from "@/types/employer/billing";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import {
  createUpgradeCheckout,
  cancelSubscription,
  createCustomerPortalSession,
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
  const upgradedInPlace = searchParams.get("upgraded") === "1";
  const downgradeScheduled = searchParams.get("downgraded") === "1";
  const [isUpgrading, startUpgradeTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();
  const [isOpeningPortal, startPortalTransition] = useTransition();

  const handleUpgrade = (planId: SubscriptionTier) => {
    if (planId === "discovery") {
      handleCancelToDiscovery();
      return;
    }

    startUpgradeTransition(async () => {
      const toastId = toast.loading(`Updating plan to ${planId}...`);
      try {
        const result = await createUpgradeCheckout(planId);
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success && result.downgradeScheduled) {
          toast.success(
            result.message ?? `Downgrade to ${planId} scheduled.`,
            { id: toastId }
          );
          router.refresh();
        } else if (result.success && result.upgraded) {
          toast.success(result.message ?? `You're now on ${planId}.`, {
            id: toastId,
          });
          router.refresh();
        } else if (result.success && result.checkoutUrl) {
          toast.success("Redirecting to Stripe checkout...", { id: toastId });
          window.location.href = result.checkoutUrl;
        } else {
          toast.error("Unexpected billing response. Please try again.", {
            id: toastId,
          });
        }
      } catch {
        toast.error("Failed to change plan. Please try again.", {
          id: toastId,
        });
      }
    });
  };

  const handleCancelToDiscovery = () => {
    if (
      !confirm(
        "Switch to Discovery at period end? You keep your current plan until then, then move to the free Discovery tier."
      )
    ) {
      return;
    }
    handleCancel();
  };

  const handleCancel = () => {
    startCancelTransition(async () => {
      const toastId = toast.loading("Scheduling move to Discovery...");
      try {
        const result = await cancelSubscription();
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success) {
          toast.success(result.message || "Cancellation scheduled.", {
            id: toastId,
          });
          router.refresh();
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
                {downgradeScheduled
                  ? "Downgrade scheduled"
                  : upgradedInPlace
                    ? "Plan updated — you're on your new tier"
                    : "Payment successful — welcome to your new plan"}
              </p>
              <p className="text-xs text-emerald-900/80 font-medium mt-1">
                {downgradeScheduled
                  ? "Your lower tier starts at the end of the current billing period. You keep current entitlements until then."
                  : upgradedInPlace
                    ? "Your existing subscription was upgraded in place (with proration). Entitlements are available now."
                    : "Your entitlements update within a minute after Stripe confirms payment. Post a job or review applicants to use your new limits."}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-[#006e2f] hover:bg-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Refresh plan status
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
          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {scheduled === "discovery"
                  ? "Moving to Discovery at period end"
                  : `Downgrade to ${TIER_LABELS[scheduled]} scheduled`}
              </p>
              <p className="mt-1 text-xs font-medium text-amber-900/80">
                You keep {TIER_LABELS[initialSettings.plan]} until{" "}
                {scheduledAt ? formatDate(scheduledAt) : "the end of this billing period"}
                . Upgrade anytime to cancel this change.
              </p>
            </div>
          </div>
          <Link
            href="#manage-plan"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300/80 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
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

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <ActivePlanSidebar
            currentPlan={initialSettings.plan}
            isCancelling={isCancelling}
            cancelAtPeriodEnd={initialSettings.cancelAtPeriodEnd}
            hasStripeSubscription={initialSettings.hasStripeSubscription}
            isOpeningPortal={isOpeningPortal}
            nextBillingDate={initialSettings.nextBillingDate}
            scheduledPlan={initialSettings.scheduledPlan}
            scheduledEffectiveAt={initialSettings.scheduledEffectiveAt}
            onCancel={handleCancel}
            onManageBilling={handleManageBilling}
          />
        </div>
      </div>
    </div>
  );
}
