import React from "react";

export default function UserBookmarksLoading() {
  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-60 bg-default-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-96 bg-default-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 overflow-hidden">
        <div className="h-12 bg-default-100 dark:bg-zinc-800/60 border-b border-default-100 dark:border-zinc-800" />
        <div className="p-6 flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-16 rounded-2xl bg-default-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-44 bg-default-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-28 bg-default-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-24 bg-default-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-9 w-24 bg-default-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
