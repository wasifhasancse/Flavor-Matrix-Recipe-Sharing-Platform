"use client";


import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";

const CATEGORIES = ["All", "Italian", "Asian", "Mexican", "Desserts", "Seafood", "Salads", "Soups"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const SORT_OPTIONS = [
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "most_liked", label: "Most Liked" },
  { key: "least_liked", label: "Least Liked" },
  { key: "title_asc", label: "Title (A-Z)" },
  { key: "title_desc", label: "Title (Z-A)" },
];

export function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "All";
  const currentDifficulty = searchParams.get("difficultyLevel") || "All";
  
  // Parse current sort to match our keys
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  let currentSortKey = "newest";
  if (sortBy === "createdAt" && sortOrder === "asc") currentSortKey = "oldest";
  if (sortBy === "likes" && sortOrder === "desc") currentSortKey = "most_liked";
  if (sortBy === "likes" && sortOrder === "asc") currentSortKey = "least_liked";
  if (sortBy === "title" && sortOrder === "asc") currentSortKey = "title_asc";
  if (sortBy === "title" && sortOrder === "desc") currentSortKey = "title_desc";

  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "All" || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page to 1 when filters change
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const query = createQueryString(updates);
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const handleSortChange = (key: string) => {
    let sortBy = "createdAt";
    let sortOrder = "desc";
    if (key === "oldest") sortOrder = "asc";
    if (key === "most_liked") { sortBy = "likes"; sortOrder = "desc"; }
    if (key === "least_liked") { sortBy = "likes"; sortOrder = "asc"; }
    if (key === "title_asc") { sortBy = "title"; sortOrder = "asc"; }
    if (key === "title_desc") { sortBy = "title"; sortOrder = "desc"; }

    handleFilterChange({ sortBy, sortOrder });
  };

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (searchParams.get("search") || "")) {
        handleFilterChange({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full items-center bg-default-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-default-100 dark:border-zinc-800">
      <div className="relative w-full md:w-96 flex-shrink-0">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="text-default-400 h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search recipes by name, author..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={isPending}
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      </div>
      
      <div className="flex gap-2 w-full flex-wrap sm:flex-nowrap">
        <div className="relative w-full sm:w-40 flex-shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter className="text-default-400 h-4 w-4" />
          </div>
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
            disabled={isPending}
            aria-label="Filter by Category"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-40 flex-shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter className="text-default-400 h-4 w-4" />
          </div>
          <select
            value={currentDifficulty}
            onChange={(e) => handleFilterChange({ difficultyLevel: e.target.value })}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
            disabled={isPending}
            aria-label="Filter by Difficulty"
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div className="relative w-full sm:w-48 flex-shrink-0 sm:ml-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <ArrowUpDown className="text-default-400 h-4 w-4" />
          </div>
          <select
            value={currentSortKey}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none disabled:opacity-50"
            disabled={isPending}
            aria-label="Sort Recipes"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
