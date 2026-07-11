import { createClient } from "@/lib/supabase/server";
import { WorkerTransaction } from "@/types/worker";

export interface WorkerFinancials {
  transactions: WorkerTransaction[];
  totalCount: number;
  metrics: {
    totalEarnings: number;
    pendingEscrow: number;
    availableWithdrawal: number;
  };
  currency: string;
}

export async function getWorkerFinancials(
  workerId: string,
  currency: string = "PHP",
  params: {
    search?: string;
    range?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<WorkerFinancials> {
  const page = Number(params.page ?? "1");
  const limit = Number(params.limit ?? "5");
  const search = params.search?.trim() ?? "";
  const range = params.range ?? "all_time";
  const status = params.status ?? "all";

  const supabase = await createClient();

  // 1. Fetch all transactions for this worker to compute lifetime metrics
  const { data: allTx, error: allTxError } = await supabase
    .from("worker_transactions")
    .select("amount, status")
    .eq("worker_id", workerId);

  if (allTxError || !allTx) {
    console.error("Error fetching worker transactions metrics:", allTxError);
    return {
      transactions: [],
      totalCount: 0,
      metrics: {
        totalEarnings: 0,
        pendingEscrow: 0,
        availableWithdrawal: 0,
      },
      currency,
    };
  }

  // Compute lifetime metrics from actual database data
  const totalEarnings = allTx
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const pendingEscrow = allTx
    .filter((tx) => tx.status === "pending" || tx.status === "processing")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const availableWithdrawal = totalEarnings; // Assuming all paid funds are available for withdrawal

  // 2. Fetch filtered and paginated transactions from the database
  let query = supabase
    .from("worker_transactions")
    .select("*", { count: "exact" })
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  // Apply Search by client or job title
  if (search) {
    query = query.or(`job_title.ilike.%${search}%,client_name.ilike.%${search}%`);
  }

  // Apply Status filter
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // Apply Date Range filter
  const now = new Date();
  if (range === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    query = query.gte("created_at", startOfMonth.toISOString());
  } else if (range === "last_30_days") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte("created_at", thirtyDaysAgo.toISOString());
  } else if (range === "ytd") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    query = query.gte("created_at", startOfYear.toISOString());
  }

  // Apply Pagination range
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching worker transactions list:", error);
    return {
      transactions: [],
      totalCount: 0,
      metrics: {
        totalEarnings,
        pendingEscrow,
        availableWithdrawal,
      },
      currency,
    };
  }

  type TxRow = {
    id: string;
    created_at: string;
    job_title: string;
    client_name: string;
    amount: number | string;
    currency: string;
    status: "paid" | "pending" | "processing";
    reference_number: string | null;
  };

  const transactions: WorkerTransaction[] = data.map((tx: TxRow) => ({
    id: tx.id,
    date: tx.created_at.split("T")[0],
    job_title: tx.job_title,
    client_name: tx.client_name,
    amount: Number(tx.amount),
    currency: tx.currency,
    status: tx.status,
    reference_number: tx.reference_number ?? `TXN-${tx.id.slice(0, 8).toUpperCase()}`,
  }));

  return {
    transactions,
    totalCount: count ?? 0,
    metrics: {
      totalEarnings,
      pendingEscrow,
      availableWithdrawal,
    },
    currency,
  };
}
