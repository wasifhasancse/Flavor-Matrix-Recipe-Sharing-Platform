import React from "react";

export default function AdminDashboardLoading() {
  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-default-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-96 bg-default-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* 5 Core Metric Stat Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-default-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-default-200 dark:bg-zinc-800 rounded mt-1" />
            <div className="h-4 w-16 bg-default-200 dark:bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* Recharts Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 h-80 flex flex-col gap-4">
          <div className="h-6 w-48 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex-1 bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
        </div>

        <div className="lg:col-span-4 p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 h-80 flex flex-col gap-4">
          <div className="h-6 w-40 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex-1 bg-default-200/50 dark:bg-zinc-800/50 rounded-full h-44 w-44 mx-auto" />
        </div>
      </div>
    </div>
  );
}
