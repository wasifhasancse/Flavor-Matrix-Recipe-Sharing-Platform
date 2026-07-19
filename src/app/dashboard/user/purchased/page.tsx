"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button, Chip, Avatar } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Eye,
  Calendar,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Lock,
  Loader2,
  CheckCircle2,
  Compass,
  KeyRound,
  ShieldCheck,
  Search,
  AlertCircle,
} from "lucide-react";
import { mockRecipes } from "@/data/recipes";
import { EmptyState } from "@/components/shared/EmptyState";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export interface PurchasedRecipeItem {
  _id?: string;
  recipeId: string;
  title: string;
  image: string;
  category: string;
  author: string;
  amountPaid: number;
  purchaseDate: string;
  transactionId: string;
}

const ITEMS_PER_PAGE = 10;

export default function PurchasedRecipesPage() {
  const { data: session, isPending } = authClient.useSession();

  const [purchasedList, setPurchasedList] = useState<PurchasedRecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!session?.user) return;

    const loadPurchased = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/payments/my");
        if (!res.ok) throw new Error("Failed to fetch purchased recipes.");
        const data = await res.json();

        const payments: any[] = data.payments || [];

        // Map payments to UI items, enriching with recipe metadata from mock data
        const enriched: PurchasedRecipeItem[] = payments
          .filter((p) => p.paymentStatus === "paid")
          .map((p) => {
            const recipe = mockRecipes.find((r) => r.id === p.recipeId);
            return {
              _id: p._id?.toString() || p.transactionId,
              recipeId: p.recipeId,
              title: recipe?.title || p.recipeId,
              image:
                recipe?.image ||
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
              category: recipe?.category || "Premium",
              author: recipe?.author || "Chef",
              amountPaid: Number(p.amount) || 0,
              purchaseDate: p.paidAt
                ? new Date(p.paidAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown",
              transactionId: p.transactionId || "",
            };
          });

        // Also mark localStorage for recipe page unlock (persist access)
        enriched.forEach((item) => {
          localStorage.setItem(`purchased_${item.recipeId}`, "true");
        });

        setPurchasedList(enriched);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchased();
  }, [session]);

  const filteredList = purchasedList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading your purchased recipes...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">You must be logged in to view your purchased recipes.</p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-emerald-500" />
            <span>Unlocked Premium Content</span>
          </h1>
          <p className="text-sm text-default-400 mt-0.5">
            Your permanently unlocked chef recipes — stored securely in our database.
          </p>
        </div>

        <Link href="/recipes" className="no-underline">
          <Button
            variant="primary"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Premium Catalog</span>
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar & Count */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search by title, category or author..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Chip color="success" variant="soft" className="font-extrabold text-xs">
            {purchasedList.length} {purchasedList.length === 1 ? "Recipe" : "Recipes"} Unlocked
          </Chip>
        </div>
      </div>

      {/* Table */}
      {paginatedItems.length > 0 ? (
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
                    <th className="px-6 py-4">Purchased Recipe</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4 text-center">Access</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedItems.map((item) => (
                    <motion.tr
                      key={item._id || item.transactionId}
                      whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.03)" }}
                      className="transition-smooth"
                    >
                      {/* Recipe + Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-12 w-16 rounded-2xl object-cover border border-default-100 dark:border-zinc-800 shadow-sm shrink-0"
                          />
                          <div className="flex flex-col truncate max-w-[200px]">
                            <span className="font-extrabold text-foreground truncate">{item.title}</span>
                            <span className="text-[10px] text-default-400 uppercase tracking-wider font-semibold">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                            {item.author.charAt(0)}
                          </div>
                          <span className="font-semibold text-xs text-foreground">{item.author}</span>
                        </div>
                      </td>

                      {/* Purchase Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-default-400">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{item.purchaseDate}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ${item.amountPaid.toFixed(2)}
                        </span>
                      </td>

                      {/* Access */}
                      <td className="px-6 py-4 text-center">
                        <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
                          <ShieldCheck className="h-3 w-3 mr-1 inline text-emerald-500" />
                          Lifetime Access
                        </Chip>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link href={`/recipes/${item.recipeId}`} className="no-underline inline-flex">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm border-none cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Recipe</span>
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of{" "}
                {filteredList.length} items
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
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
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-default-50 dark:bg-zinc-900 text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <EmptyState
          icon={KeyRound}
          variant="emerald"
          title={searchTerm ? "No Matching Purchased Recipes" : "No Purchased Recipes Yet"}
          description={
            searchTerm
              ? "No purchased recipes matched your search. Try clearing the search."
              : "When you buy premium chef recipes through Stripe, they will appear here with lifetime access."
          }
          actionLabel="Explore Premium Catalog"
          actionLink="/recipes"
        />
      )}
    </div>
  );
}
