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
  ShoppingBag,
  Eye,
  Calendar,
  DollarSign,
  User,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Loader2,
  CheckCircle2,
  Compass,
  KeyRound,
  ShieldCheck,
  Tag,
  Search,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

// Interface for Purchased Recipe Data Mapping
export interface PurchasedRecipeItem {
  id: string;
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

  // Data States
  const [purchasedList, setPurchasedList] = useState<PurchasedRecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load Purchased Recipes from localStorage / mock database
  useEffect(() => {
    if (!session?.user) return;

    setIsLoading(true);

    const purchased: PurchasedRecipeItem[] = [];

    mockRecipes.forEach((r, idx) => {
      const isBought = localStorage.getItem(`purchased_${r.id}`) === "true";
      if (isBought || idx < 2) {
        purchased.push({
          id: `pur-${r.id}`,
          recipeId: r.id,
          title: r.title,
          image: r.image,
          category: r.category,
          author: r.author || "Master Chef",
          amountPaid: r.price || 4.99,
          purchaseDate: new Date(Date.now() - idx * 86400000 * 3).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          transactionId: `txn_stripe_${r.id}_982`,
        });
      }
    });

    setPurchasedList(purchased);
    setIsLoading(false);
  }, [session]);

  // Filtered List based on Search Term
  const filteredList = purchasedList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Calculations (Capped strictly at 10 items per page)
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
      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-default-400">
            <Link href="/dashboard/user" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Purchased Recipes</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-emerald-500" />
            <span>Unlocked Premium Content</span>
          </h1>
        </div>

        <Link href="/recipes" className="no-underline">
          <Button
            variant="primary"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 border-none cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Premium Catalog</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar & Summary Chip */}
      <div className="p-4 sm:p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search purchased items by title or author..."
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
            {purchasedList.length} Recipes Unlocked
          </Chip>
        </div>
      </div>

      {/* Main Purchased Recipes HeroUI Table */}
      {paginatedItems.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="overflow-hidden rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Purchased Recipe</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4 text-center">Access Key</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.03)" }}
                      className="transition-colors"
                    >
                      {/* Column 1: Image & Title */}
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

                      {/* Column 2: Author Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar.Root className="w-6 h-6 rounded-full border bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                            <Avatar.Fallback>{item.author.charAt(0)}</Avatar.Fallback>
                          </Avatar.Root>
                          <span className="font-semibold text-xs text-foreground">{item.author}</span>
                        </div>
                      </td>

                      {/* Column 3: Purchase Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-default-400">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{item.purchaseDate}</span>
                        </div>
                      </td>

                      {/* Column 4: Amount Paid */}
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ${item.amountPaid.toFixed(2)}
                        </span>
                      </td>

                      {/* Column 5: Access Key Badge */}
                      <td className="px-6 py-4 text-center">
                        <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
                          <ShieldCheck className="h-3 w-3 mr-1 inline text-emerald-500" />
                          Lifetime Access
                        </Chip>
                      </td>

                      {/* Column 6: View Details Button */}
                      <td className="px-6 py-4 text-right">
                        <Link href={`/recipes/${item.recipeId}`} className="no-underline inline-flex">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm border-none cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Details</span>
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HeroUI-styled Pagination Control (capped strictly at max 10 items per page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length} items
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
        /* Empty State Layout */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="py-20 px-6 text-center border-2 border-dashed border-default-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center gap-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md"
        >
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <KeyRound className="h-10 w-10 stroke-[2]" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-md">
            <h3 className="text-xl font-extrabold text-foreground">
              {searchTerm ? "No Matching Purchased Recipes" : "No Purchased Recipes Yet"}
            </h3>
            <p className="text-xs text-default-500 leading-relaxed">
              {searchTerm
                ? "No purchased recipes matched your search criteria. Try clearing your search input."
                : "When you buy premium chef recipes through our secure Stripe integration, they will display here with permanent lifetime access keys."}
            </p>
          </div>

          <Link href="/recipes" className="no-underline mt-2">
            <Button
              variant="primary"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 border-none cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Premium Catalog</span>
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
