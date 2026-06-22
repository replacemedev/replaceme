"use client";

import React, { useTransition } from "react";
import { SubscriptionTier, AccountSettings } from "@/types/employer/billing";
import { createUpgradeCheckout, cancelSubscription } from "@/actions/employer/billing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Presentation Components
import { AccountDetailsList } from "@/components/employer/settings/account/AccountDetailsList";
import { ManagePlanGrid } from "@/components/employer/settings/account/ManagePlanGrid";
import { ActivePlanSidebar } from "@/components/employer/settings/account/ActivePlanSidebar";

interface AccountSettingsClientProps {
  initialSettings: AccountSettings;
}

export function AccountSettingsClient({ initialSettings }: AccountSettingsClientProps) {
  const router = useRouter();
  const [isUpgrading, startUpgradeTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();

  const handleUpgrade = (planId: SubscriptionTier) => {
    startUpgradeTransition(async () => {
      const toastId = toast.loading(`Preparing checkout for ${planId} plan...`);
      try {
        const result = await createUpgradeCheckout(planId);
        if (result.error) {
          toast.error(result.error, { id: toastId });
        } else if (result.success && result.checkoutUrl) {
          toast.success("Redirecting to Stripe checkout...", { id: toastId });
          // Redirect to checkout URL
          window.location.href = result.checkoutUrl;
        }
      } catch (error) {
        toast.error("Failed to initiate checkout. Please try again.", { id: toastId });
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
          toast.success(result.message || "Subscription cancelled.", { id: toastId });
          router.refresh();
        }
      } catch (error) {
        toast.error("Failed to cancel subscription. Please try again.", { id: toastId });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column - Main Details & Manage Plan */}
      <div className="lg:col-span-2 space-y-8">
        {/* Account Details */}
        <AccountDetailsList />

        {/* Manage Plan Grid */}
        <ManagePlanGrid
          currentPlan={initialSettings.plan}
          isUpgrading={isUpgrading}
          onUpgrade={handleUpgrade}
        />
      </div>

      {/* Right Column - Plan Features Sidebar */}
      <div className="lg:col-span-1">
        <ActivePlanSidebar
          currentPlan={initialSettings.plan}
          isCancelling={isCancelling}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
