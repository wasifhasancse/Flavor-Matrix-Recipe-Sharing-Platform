import React from "react";

export default function UserTransactionsLoading() {
  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-60 bg-default-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-80 bg-default-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Summary Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-default-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-default-200 dark:bg-zinc-800 rounded mt-1" />
            <div className="h-3 w-36 bg-default-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 overflow-hidden">
        <div className="h-12 bg-default-100 dark:bg-zinc-800/60 border-b border-default-100 dark:border-zinc-800" />
        <div className="p-6 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-5 w-48 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-20 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-6 w-20 bg-default-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-5 w-32 bg-default-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
