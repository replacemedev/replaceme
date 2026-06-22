"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { DashboardStats, JobPost, Message, WorkerProfile, BillingPlan } from "@/types/employer/dashboard";

/**
 * Helper function to verify that the active session belongs to an employer
 * and matches the requested profile ID to prevent IDOR attacks.
 */
async function verifyEmployerSession(employerProfileId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    // Fetch the user's role and profile ID directly from the database (never trust client claims)
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_user_id", user.id)
      .single();

    if (dbError || !profile) {
      return false;
    }

    // Verify role is employer and ID matches to prevent IDOR
    if (profile.role !== "employer" || profile.id !== employerProfileId) {
      return false;
    }

    return true;
  } catch (err) {
    safeError("Authentication check failed", err);
    return false;
  }
}

export async function getDashboardStats(employerProfileId: string): Promise<DashboardStats> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  // Returns empty stats placeholder for data integration phase
  return {
    activeJobPosts: 0,
    totalApplicants: 0,
    hiredWorkers: 0,
    unreadMessages: 0,
  };
}

export async function getRecentJobs(employerProfileId: string): Promise<JobPost[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  return [];
}

export async function getRecentMessages(employerProfileId: string): Promise<Message[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  return [];
}

export async function getPinnedTalent(employerProfileId: string): Promise<WorkerProfile[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  return [];
}

export async function getYourWorkers(employerProfileId: string): Promise<WorkerProfile[]> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  return [];
}

export async function getBillingPlan(employerProfileId: string): Promise<BillingPlan | null> {
  const isAuthorized = await verifyEmployerSession(employerProfileId);
  if (!isAuthorized) {
    throw new Error("Unauthorized access");
  }

  return {
    name: "Essential Plan",
    price: "$30/mo",
    status: "ACTIVE",
    usage: {
      candidateUnlocks: {
        used: 12,
        total: 75,
      },
      jobPosts: {
        used: 1,
        total: 3,
      },
    },
  };
}
