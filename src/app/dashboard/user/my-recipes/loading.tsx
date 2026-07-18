import React from "react";

export default function MyRecipesLoading() {
  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 bg-default-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-72 bg-default-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-36 bg-default-200 dark:bg-zinc-800 rounded-xl" />
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row gap-4">
        <div className="h-10 flex-1 bg-default-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-10 w-44 bg-default-200 dark:bg-zinc-800 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 overflow-hidden">
        <div className="h-12 bg-default-100 dark:bg-zinc-800/60 border-b border-default-100 dark:border-zinc-800" />
        <div className="p-6 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 rounded-xl bg-default-200 dark:bg-zinc-800" />
                <div className="h-5 w-40 bg-default-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-5 w-24 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-16 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-24 bg-default-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
