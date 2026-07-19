"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@heroui/react";

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
    <div className="flex justify-center items-center mt-8 w-full">
      <Pagination
        total={total}
        page={initialPage}
        onChange={handlePageChange}
        variant="faded"
        color="primary"
        size="lg"
        radius="md"
        classNames={{
          cursor: "bg-primary text-white font-bold",
        }}
      />
    </div>
  );
}
