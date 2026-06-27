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
import { CheckCircle2, RefreshCw } from "lucide-react";

import Link from "next/link";
import { AccountDetailsList } from "@/components/employer/settings/account/AccountDetailsList";
import { ManagePlanGrid } from "@/components/employer/settings/account/ManagePlanGrid";
import { ActivePlanSidebar } from "@/components/employer/settings/account/ActivePlanSidebar";
import { PlanFeatureChecklist } from "@/components/employer/settings/account/PlanFeatureChecklist";
import { PlanUsageCard } from "@/components/shared/billing/PlanUsageCard";

interface AccountSettingsClientProps {
  initialSettings: AccountSettings;
  planUsage: EmployerPlanUsage | null;
}

export function AccountSettingsClient({
  initialSettings,
  planUsage,
}: AccountSettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [isUpgrading, startUpgradeTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();
  const [isOpeningPortal, startPortalTransition] = useTransition();

  const handleUpgrade = (planId: SubscriptionTier) => {
    if (planId === "discovery") return;

    startUpgradeTransition(async () => {
      const toastId = toast.loading(`Preparing checkout for ${planId}...`);
      try {
        const result = await createUpgradeCheckout(planId);
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success && result.checkoutUrl) {
          toast.success("Redirecting to Stripe checkout...", { id: toastId });
          window.location.href = result.checkoutUrl;
        }
      } catch {
        toast.error("Failed to initiate checkout. Please try again.", {
          id: toastId,
        });
      }
    });
  };

  const handleCancel = () => {
    startCancelTransition(async () => {
      const toastId = toast.loading("Processing subscription cancellation...");
      try {
        const result = await cancelSubscription();
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success) {
          toast.success(result.message || "Subscription cancelled.", {
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
                Payment successful — welcome to your new plan
              </p>
              <p className="text-xs text-emerald-900/80 font-medium mt-1">
                Your entitlements update within a minute after Stripe confirms
                payment. Post a job or review applicants to use your new limits.
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

      {planUsage ? <PlanUsageCard usage={planUsage} /> : null}

      <PlanFeatureChecklist
        currentPlan={initialSettings.plan}
        planUsage={planUsage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <AccountDetailsList />
          <ManagePlanGrid
            currentPlan={initialSettings.plan}
            isUpgrading={isUpgrading}
            onUpgrade={handleUpgrade}
            onManageBilling={handleManageBilling}
            isOpeningPortal={isOpeningPortal}
            nextBillingDate={initialSettings.nextBillingDate}
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
            onCancel={handleCancel}
            onManageBilling={handleManageBilling}
          />
        </div>
      </div>
    </div>
  );
}
