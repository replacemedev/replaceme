"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileText, Receipt } from "lucide-react";
import type { EmployerInvoiceRow } from "@/lib/server/stripe/list-invoices";
import { formatMoney } from "@/lib/format/currency";

interface EmployerInvoicesPanelProps {
  invoices: EmployerInvoiceRow[];
  error?: string | null;
}

function monthKey(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function statusStyles(status: string | null): string {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
    case "open":
      return "bg-amber-50 text-amber-800 ring-amber-600/20";
    case "void":
    case "uncollectible":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
    case "draft":
      return "bg-slate-50 text-slate-500 ring-slate-400/20";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-400/20";
  }
}

export function EmployerInvoicesPanel({
  invoices,
  error,
}: EmployerInvoicesPanelProps) {
  const months = useMemo(() => {
    const keys = new Set(invoices.map((i) => monthKey(i.created)));
    return [...keys].sort((a, b) => b.localeCompare(a));
  }, [invoices]);

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return invoices;
    return invoices.filter((i) => monthKey(i.created) === selectedMonth);
  }, [invoices, selectedMonth]);

  const ITEMS_PER_PAGE = 10;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedInvoices = useMemo(() => {
    const startIdx = (activePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filtered, activePage]);

  return (
    <section
      id="invoices"
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm scroll-mt-24"
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-br from-[#fafdfb] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
            Billing
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <Receipt className="h-5 w-5 text-[#006e2f]" aria-hidden />
            Invoices
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Stripe invoices for this account. Open View for the hosted receipt or PDF.
          </p>
        </div>

        {months.length > 0 ? (
          <label className="flex shrink-0 flex-col gap-1 text-xs font-semibold text-slate-500 sm:items-end">
            <span className="sr-only">Filter by month</span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 sm:min-w-[10rem]"
            >
              <option value="all">All months</option>
              {months.map((key) => (
                <option key={key} value={key}>
                  {monthLabel(key)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {error ? (
        <p className="px-5 py-6 text-sm font-medium text-amber-800 sm:px-6" role="alert">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center sm:px-6">
          <FileText className="h-8 w-8 text-slate-300" aria-hidden />
          <p className="text-sm font-bold text-slate-700">No invoices yet</p>
          <p className="max-w-sm text-xs font-medium text-slate-500">
            After your first paid subscription charge, invoices will show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {paginatedInvoices.map((inv) => (
              <li key={inv.id} className="space-y-2 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(inv.created * 1000).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 line-clamp-2">
                      {inv.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyles(inv.status)}`}
                  >
                    {inv.status ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-slate-900">
                    {formatMoney(inv.amountPaid / 100, inv.currency, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {inv.hostedInvoiceUrl || inv.invoicePdf ? (
                    <a
                      href={inv.hostedInvoiceUrl ?? inv.invoicePdf ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#006e2f] hover:bg-emerald-50"
                    >
                      View
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block w-full pb-1.5">
            <table className="w-full text-left text-sm table-fixed">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold w-[15%]">Date</th>
                  <th className="px-4 py-3 font-semibold w-[45%]">Description</th>
                  <th className="px-4 py-3 font-semibold w-[15%]">Status</th>
                  <th className="px-4 py-3 font-semibold w-[15%]">Amount</th>
                  <th className="px-5 py-3 font-semibold text-right w-[10%]">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/40">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-800">
                      {new Date(inv.created * 1000).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-0">
                      {inv.description}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyles(inv.status)}`}
                      >
                        {inv.status ?? "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900">
                      {formatMoney(inv.amountPaid / 100, inv.currency, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      {inv.hostedInvoiceUrl || inv.invoicePdf ? (
                        <a
                          href={inv.hostedInvoiceUrl ?? inv.invoicePdf ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006e2f] hover:underline"
                        >
                          View
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500 text-center sm:text-left">
              Showing <span className="font-semibold text-slate-800">{totalItems === 0 ? 0 : (activePage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">{Math.min(activePage * ITEMS_PER_PAGE, totalItems)}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalItems}</span> results
            </p>
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="inline-flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
