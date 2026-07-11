import { WorkerTransaction } from "@/types/worker";

interface ExchangeRates {
  [key: string]: number;
}

let cachedRates: ExchangeRates | null = null;
let lastFetched: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache (1 hour)

// Fetches live exchange rates from a public API with safe offline fallbacks
async function getUsdRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && (now - lastFetched) < CACHE_DURATION) {
    return cachedRates;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 } // Cache for 1 hour in Next.js
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        cachedRates = data.rates;
        lastFetched = now;
        return cachedRates!;
      }
    }
  } catch (error) {
    console.error("Failed to fetch USD exchange rates, using fallback rates:", error);
  }
  // Safe fallbacks in case exchange rates API is down
  return {
    USD: 1.0,
    PHP: 58.5,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.51,
    CAD: 1.37,
    SGD: 1.35,
  };
}

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
  const search = params.search?.trim().toLowerCase() ?? "";
  const range = params.range ?? "all_time";
  const status = params.status ?? "all";

  // 1. Fetch current exchange rates
  const rates = await getUsdRates();
  const rate = rates[currency] ?? rates.PHP ?? 58.5; // Fallback to PHP rate if currency not found

  // 2. Generate deterministic transactions based on workerId
  const now = new Date();
  
  // Helpers for relative dates
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(now.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  const monthsAgo = (months: number) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - months);
    return d.toISOString().split("T")[0];
  };

  // Base deterministic USD transactions
  const baseTransactions = [
    {
      id: "tx-1",
      date: daysAgo(3),
      job_title: "Next.js Frontend Overhaul",
      client_name: "Vercel",
      amountUsd: 950,
      status: "processing" as const,
      reference_number: "TXN-VRC-9831",
    },
    {
      id: "tx-2",
      date: daysAgo(5),
      job_title: "UI/UX Component Library",
      client_name: "Stripe",
      amountUsd: 1200,
      status: "pending" as const,
      reference_number: "TXN-STR-4412",
    },
    {
      id: "tx-3",
      date: daysAgo(12),
      job_title: "Supabase Database Migration",
      client_name: "Supabase",
      amountUsd: 1800,
      status: "paid" as const,
      reference_number: "TXN-SUP-2091",
    },
    {
      id: "tx-4",
      date: daysAgo(25),
      job_title: "Landing Page Optimization",
      client_name: "Acme Corp",
      amountUsd: 850,
      status: "paid" as const,
      reference_number: "TXN-ACM-0098",
    },
    {
      id: "tx-5",
      date: monthsAgo(2),
      job_title: "React Native Mobile App",
      client_name: "Vercel",
      amountUsd: 3200,
      status: "paid" as const,
      reference_number: "TXN-VRC-1102",
    },
    {
      id: "tx-6",
      date: monthsAgo(4),
      job_title: "API Gateway Design",
      client_name: "Linear",
      amountUsd: 1500,
      status: "paid" as const,
      reference_number: "TXN-LIN-9912",
    },
    {
      id: "tx-7",
      date: monthsAgo(9),
      job_title: "E-commerce Checkout Flow",
      client_name: "Acme Corp",
      amountUsd: 2200,
      status: "paid" as const,
      reference_number: "TXN-ACM-2231",
    },
    {
      id: "tx-8",
      date: monthsAgo(14),
      job_title: "Technical Documentation",
      client_name: "Supabase",
      amountUsd: 1100,
      status: "paid" as const,
      reference_number: "TXN-SUP-7782",
    },
  ];

  // Convert USD base amounts to the worker's target profile currency
  const allTransactions: WorkerTransaction[] = baseTransactions.map((tx) => ({
    id: `${tx.id}-${workerId.slice(0, 4)}`,
    date: tx.date,
    job_title: tx.job_title,
    client_name: tx.client_name,
    amount: Math.round(tx.amountUsd * rate),
    currency,
    status: tx.status,
    reference_number: tx.reference_number,
  }));

  // 3. Compute overall account metrics (unfiltered, representing lifetime stats)
  const totalEarnings = allTransactions
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingEscrow = allTransactions
    .filter((tx) => tx.status === "pending" || tx.status === "processing")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Available for withdrawal: latest paid amount that is available (deterministic, e.g. 1800 USD converted)
  const availableWithdrawal = Math.round(1800 * rate);

  // 4. Apply filters to the transaction history table
  let filtered = [...allTransactions];

  // Search filter
  if (search) {
    filtered = filtered.filter(
      (tx) =>
        tx.job_title.toLowerCase().includes(search) ||
        tx.client_name.toLowerCase().includes(search)
    );
  }

  // Status filter
  if (status !== "all") {
    filtered = filtered.filter((tx) => tx.status === status);
  }

  // Date range filter
  const currentMonthYear = now.toISOString().slice(0, 7); // YYYY-MM
  const currentYear = now.getFullYear();
  const dateThirtyDaysAgo = daysAgo(30);

  if (range === "this_month") {
    filtered = filtered.filter((tx) => tx.date.startsWith(currentMonthYear));
  } else if (range === "last_30_days") {
    filtered = filtered.filter((tx) => tx.date >= dateThirtyDaysAgo);
  } else if (range === "ytd") {
    filtered = filtered.filter((tx) => {
      const txYear = new Date(tx.date).getFullYear();
      return txYear === currentYear;
    });
  }

  // 5. Apply pagination
  const totalCount = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = filtered.slice(startIndex, startIndex + limit);

  return {
    transactions: paginatedTransactions,
    totalCount,
    metrics: {
      totalEarnings,
      pendingEscrow,
      availableWithdrawal,
    },
    currency,
  };
}
