"use client";

interface TablePaginationProps {
  totalItems: number;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}

export function TablePagination({
  totalItems,
  pageSize = 20,
  currentPage,
  onPageChange,
  label = "entries",
  className = "border-t border-slate-100 bg-white px-4 py-4 mt-4",
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full ${className}`}>
      <div className="hidden sm:block text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-750">{startIdx}</span> to{" "}
        <span className="font-semibold text-slate-750">{endIdx}</span> of{" "}
        <span className="font-semibold text-slate-750">{totalItems}</span> {label}
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          Previous
        </button>
        <div className="hidden sm:flex items-center gap-1.5">
          {getPageNumbers().map((page, index) => {
            if (typeof page === "string") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-slate-400 text-sm select-none"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  currentPage === page
                    ? "bg-[#006e2f] text-white shadow-sm font-bold"
                    : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
