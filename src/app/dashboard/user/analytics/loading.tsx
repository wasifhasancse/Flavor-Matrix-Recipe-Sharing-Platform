import React from "react";

export default function UserAnalyticsLoading() {
  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-60 bg-default-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-96 bg-default-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-default-100 dark:bg-zinc-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 rounded-3xl bg-default-100 dark:bg-zinc-800" />
        <div className="h-80 rounded-3xl bg-default-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
