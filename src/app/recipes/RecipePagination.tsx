"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RecipePaginationProps {
  total: number;
  initialPage: number;
}

export function RecipePagination({ total, initialPage }: RecipePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > total) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (total <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-8 w-full gap-2">
      <button
        onClick={() => handlePageChange(initialPage - 1)}
        disabled={initialPage <= 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-default-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
            p === initialPage 
              ? "bg-primary text-white shadow-md" 
              : "bg-transparent text-default-600 hover:bg-default-100"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(initialPage + 1)}
        disabled={initialPage >= total}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-default-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
