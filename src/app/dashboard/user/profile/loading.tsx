import React from "react";

export default function ProfileLoading() {
  return (
    <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 bg-default-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-4 w-72 bg-default-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Main Profile Card Skeleton */}
      <div className="p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-24 w-24 rounded-3xl bg-default-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div className="h-6 w-48 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-36 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-24 bg-default-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-6 w-28 bg-default-200 dark:bg-zinc-800 rounded-full" />
          </div>
        </div>
        <div className="h-10 w-32 bg-default-200 dark:bg-zinc-800 rounded-2xl w-full sm:w-auto" />
      </div>

      {/* Profile Details Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col gap-3">
            <div className="h-4 w-28 bg-default-200 dark:bg-zinc-800 rounded" />
            <div className="h-6 w-40 bg-default-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
