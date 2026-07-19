"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
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
    <div className="flex justify-center items-center mt-12 w-full">
      <div className="flex items-center gap-2 p-2 bg-default-50/50 dark:bg-zinc-900/30 backdrop-blur-xl border border-default-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
        <Button
          isIconOnly
          variant="ghost"
          className="rounded-lg bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
          onPress={() => handlePageChange(initialPage - 1)}
          isDisabled={initialPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              isIconOnly
              className={`rounded-lg font-bold transition-all ${
                p === initialPage 
                  ? "btn-primary" 
                  : "bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
              onPress={() => handlePageChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        <Button
          isIconOnly
          variant="ghost"
          className="rounded-lg bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
          onPress={() => handlePageChange(initialPage + 1)}
          isDisabled={initialPage >= total}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
