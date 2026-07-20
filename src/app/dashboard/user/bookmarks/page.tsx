"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Search,
  Filter,
  Heart,
  Clock,
} from "lucide-react";
import { Recipe, mockRecipes } from "@/data/recipes";
import { EmptyState } from "@/components/shared/EmptyState";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

const ITEMS_PER_PAGE = 10;

export interface BookmarkItem {
  id: string;
  recipeId: string;
  createdAt: string;
  recipe: Recipe;
}

export default function UserBookmarksPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Bookmarks Data
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem("user_bookmarks_list");
    if (stored) {
      setBookmarksList(JSON.parse(stored));
    } else {
      // Seed default bookmarks from mockRecipes
      const initial: BookmarkItem[] = mockRecipes.slice(0, 3).map((r, idx) => ({
        id: `bm-${idx + 1}`,
        recipeId: r.id,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
        recipe: r,
      }));
      setBookmarksList(initial);
      localStorage.setItem("user_bookmarks_list", JSON.stringify(initial));
    }
    setIsLoading(false);
  }, []);

  // Remove Bookmark Action
  const handleRemoveBookmark = (bookmarkId: string, recipeId: string) => {
    const updated = bookmarksList.filter((b) => b.id !== bookmarkId && b.recipeId !== recipeId);
    setBookmarksList(updated);
    localStorage.setItem("user_bookmarks_list", JSON.stringify(updated));

    // Call Backend API
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    fetch(`${baseUrl}/api/bookmarks/${recipeId}`, {
      method: "DELETE",
    }).catch(() => {});

    showToast("Recipe removed from your bookmarks!");
  };

  // Filter Computation
  const filteredBookmarks = bookmarksList.filter((b) =>
    b.recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.recipe.author && b.recipe.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Calculations
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBookmarks = filteredBookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading your bookmarked recipes...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Authentication Required</h1>
        <p className="text-default-500">Sign in to manage your bookmarked recipe collection.</p>
        <Link href="/login" className="no-underline">
          <Button  className="btn-primary  text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 border border-emerald-500 ambient-glow-orange flex items-center gap-3 text-xs font-bold text-white"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Bookmark className="h-7 w-7 text-primary fill-primary/20" />
            <span>My Bookmarked Recipes</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="accent" variant="soft" className="font-extrabold text-xs">
            {bookmarksList.length} Recipes Bookmarked
          </Chip>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
          />
        </div>
      </div>

      {/* HEROUI RESPONSIVE BOOKMARKS TABLE */}
      {paginatedBookmarks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="overflow-hidden rounded-3xl glass-panel ambient-glow-orange">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Recipe Preview</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4 text-center">Category</th>
                    <th className="px-6 py-4 text-center">Date Saved</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedBookmarks.map((bm) => (
                    <tr
                      key={bm.id}
                      className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                    >
                      {/* Column 1: Recipe Preview */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={bm.recipe.image}
                            alt={bm.recipe.title}
                            className="h-12 w-16 rounded-2xl object-cover border border-default-100 dark:border-zinc-800 shadow-sm shrink-0"
                          />
                          <div className="flex flex-col truncate max-w-[220px]">
                            <span className="font-extrabold text-foreground truncate text-xs">
                              {bm.recipe.title}
                            </span>
                            <span className="text-[10px] text-default-400 uppercase font-semibold">
                              {bm.recipe.prepTime || "25 mins"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Author */}
                      <td className="px-6 py-4 text-xs font-semibold text-foreground">
                        {bm.recipe.author || "Chef Creator"}
                      </td>

                      {/* Column 3: Category */}
                      <td className="px-6 py-4 text-center">
                        <Chip color="accent" variant="soft" size="sm" className="font-bold text-[10px]">
                          {bm.recipe.category}
                        </Chip>
                      </td>

                      {/* Column 4: Date Saved */}
                      <td className="px-6 py-4 text-center text-xs text-default-400 font-medium">
                        {new Date(bm.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/recipes/${bm.recipe.id}`}
                            className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground transition-smooth"
                            title="View Recipe"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleRemoveBookmark(bm.id, bm.recipeId)}
                            className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-smooth cursor-pointer"
                            title="Remove Bookmark"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookmarks.length)} of {filteredBookmarks.length} bookmarked recipes
              </span>

              <div className="flex items-center gap-1.5">
                <Button

                  size="sm"
                  isDisabled={currentPage === 1}
                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-default-50 dark:bg-zinc-900 text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <Button

                  size="sm"
                  isDisabled={currentPage === totalPages}
                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-secondary font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Empty State Fallback */
        <EmptyState
          icon={Bookmark}
          variant="primary"
          title="No Bookmarked Recipes Yet"
          description="Browse our culinary collection and save your favorite recipes for quick access anytime!"
          actionLabel="Explore Recipes Catalog"
          actionLink="/recipes"
        />
      )}
    </div>
  );
}
