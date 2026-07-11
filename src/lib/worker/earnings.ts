import { createClient } from "@/lib/supabase/server";

export interface WorkerHireRecord {
  id: string;
  dateHired: string;       // start_date from contract
  jobTitle: string;
  employerName: string;
  hourlyRate: number;
  weeklyHours: number;
  employmentType: string;
  contractStatus: string;
  currency: string;
}

export interface WorkerEarningsSummary {
  records: WorkerHireRecord[];
  totalCount: number;
  metrics: {
    totalRecordedIncome: number;   // sum of earnings_overview amounts
    activeContractsCount: number;  // count of active contracts
    projectedMonthlyIncome: number; // sum of (rate × hours × 4) for active contracts
  };
  currency: string;
}

export async function getWorkerEarningsSummary(
  workerId: string,
  currency: string = "PHP",
  params: {
    search?: string;
    range?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<WorkerEarningsSummary> {
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 8);
  const search = params.search?.trim() ?? "";
  const range = params.range ?? "all_time";

  const supabase = await createClient();

  // 1. Compute metrics ─────────────────────────────────────────────────────

  // Total recorded income from earnings_overview (manually tracked monthly totals)
  const { data: earningsRows } = await supabase
    .from("earnings_overview")
    .select("amount")
    .eq("worker_id", workerId);

  const totalRecordedIncome = (earningsRows ?? []).reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );

  // Active contracts for projections
  const { data: activeContracts } = await supabase
    .from("contracts")
    .select("hourly_rate, weekly_hours")
    .eq("worker_id", workerId)
    .eq("status", "active");

  const activeContractsCount = (activeContracts ?? []).length;
  const projectedMonthlyIncome = (activeContracts ?? []).reduce(
    (sum, c) => sum + Number(c.hourly_rate) * Number(c.weekly_hours) * 4,
    0
  );

  // 2. Fetch paginated hire records ─────────────────────────────────────────

  // Build date range filter
  const now = new Date();
  let dateFrom: string | null = null;
  if (range === "this_month") {
    dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  } else if (range === "last_30_days") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dateFrom = d.toISOString().split("T")[0];
  } else if (range === "ytd") {
    dateFrom = `${now.getFullYear()}-01-01`;
  }

  // Fetch contracts with related job title and employer company name
  let query = supabase
    .from("contracts")
    .select(
      `
      id,
      start_date,
      hourly_rate,
      weekly_hours,
      employment_type,
      status,
      job_posts ( title ),
      company_profiles!contracts_employer_id_fkey ( company_name )
      `,
      { count: "exact" }
    )
    .eq("worker_id", workerId)
    .order("start_date", { ascending: false });

  if (dateFrom) {
    query = query.gte("start_date", dateFrom);
  }

  // Paginate
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching hire records:", error);
    return {
      records: [],
      totalCount: 0,
      metrics: { totalRecordedIncome, activeContractsCount, projectedMonthlyIncome },
      currency,
    };
  }

  // Map to clean shape; apply optional search filter in memory
  // (Supabase doesn't support ilike on joined columns without views)
  type ContractRow = {
    id: string;
    start_date: string;
    hourly_rate: number | string;
    weekly_hours: number | string;
    employment_type: string;
    status: string;
    job_posts: { title: string } | { title: string }[] | null;
    company_profiles: { company_name: string } | { company_name: string }[] | null;
  };

  const mapped: WorkerHireRecord[] = (data as ContractRow[]).map((row) => {
    const job = Array.isArray(row.job_posts) ? row.job_posts[0] : row.job_posts;
    const company = Array.isArray(row.company_profiles)
      ? row.company_profiles[0]
      : row.company_profiles;

    return {
      id: row.id,
      dateHired: row.start_date,
      jobTitle: job?.title ?? "—",
      employerName: company?.company_name ?? "—",
      hourlyRate: Number(row.hourly_rate),
      weeklyHours: Number(row.weekly_hours),
      employmentType: row.employment_type,
      contractStatus: row.status,
      currency,
    };
  });

  // Client-side search across job title and employer name
  const records = search
    ? mapped.filter(
        (r) =>
          r.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
          r.employerName.toLowerCase().includes(search.toLowerCase())
      )
    : mapped;

  return {
    records,
    totalCount: count ?? 0,
    metrics: { totalRecordedIncome, activeContractsCount, projectedMonthlyIncome },
    currency,
  };
}
