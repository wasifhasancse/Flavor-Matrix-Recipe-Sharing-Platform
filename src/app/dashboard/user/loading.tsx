import React from "react";

export default function UserDashboardLoading() {
  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-16 w-16 rounded-full bg-default-200 dark:bg-zinc-800 shrink-0" />
          <div className="flex flex-col gap-2 w-48">
            <div className="h-5 w-36 bg-default-200 dark:bg-zinc-800 rounded" />
            <div className="h-3.5 w-24 bg-default-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="h-10 w-44 bg-default-200 dark:bg-zinc-800 rounded-2xl w-full sm:w-auto" />
      </div>

      {/* 3 Metric Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 bg-default-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-default-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-default-200 dark:bg-zinc-800 rounded mt-1" />
            <div className="h-3 w-32 bg-default-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Recharts Analytics Charts Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-80 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 p-6 flex flex-col gap-4">
          <div className="h-5 w-48 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex-1 bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
        </div>
        <div className="lg:col-span-5 h-80 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 p-6 flex flex-col gap-4">
          <div className="h-5 w-40 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex-1 bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
        </div>
      </div>

      {/* Quick Actions & Activity Feed Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 h-64 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 p-6 flex flex-col gap-4">
          <div className="h-5 w-36 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
            <div className="bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-6 h-64 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 p-6 flex flex-col gap-4">
          <div className="h-5 w-40 bg-default-200 dark:bg-zinc-800 rounded" />
          <div className="flex-1 bg-default-200/50 dark:bg-zinc-800/50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
