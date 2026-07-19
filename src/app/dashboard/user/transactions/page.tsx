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
  Receipt,
  Search,
  Filter,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Loader2,
  Lock,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { PaymentSchema } from "@/types/database";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockRecipes } from "@/data/recipes";

const ITEMS_PER_PAGE = 10;

// User Transaction Record Interface
export interface UserTransactionItem {
  id: string;
  transactionId: string;
  type: "purchase" | "upgrade" | "payout";
  title: string;
  amount: number;
  paymentStatus: "succeeded" | "failed" | "pending";
  date: string;
}

export default function UserTransactionsPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [userTransactions, setUserTransactions] = useState<UserTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Copy Micro-interaction
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load User Transactions
  useEffect(() => {
    if (!session?.user) return;

    setIsLoading(true);

    // Build user transaction history combining purchases and sales payouts
    const userEmail = session.user.email || "";

    const userHistory: UserTransactionItem[] = [
      {
        id: "ut-1",
        transactionId: "txn_stripe_98a71b32x",
        type: "upgrade",
        title: "Lifetime Premium Chef Membership",
        amount: 19.99,
        paymentStatus: "succeeded",
        date: "2026-07-18T14:30:00.000Z",
      },
      {
        id: "ut-2",
        transactionId: "txn_stripe_44k29m01z",
        type: "purchase",
        title: mockRecipes[0]?.title || "Truffle Tagliatelle",
        amount: 4.99,
        paymentStatus: "succeeded",
        date: "2026-07-17T18:45:00.000Z",
      },
      {
        id: "ut-3",
        transactionId: "txn_stripe_55w99z11p",
        type: "payout",
        title: "Chef Recipe Sales Royalty Payout",
        amount: 32.50,
        paymentStatus: "succeeded",
        date: "2026-07-15T12:00:00.000Z",
      },
      {
        id: "ut-4",
        transactionId: "txn_stripe_11x98q45p",
        type: "purchase",
        title: mockRecipes[1]?.title || "Matcha Souffle",
        amount: 4.99,
        paymentStatus: "failed",
        date: "2026-07-14T11:20:00.000Z",
      },
    ];

    setUserTransactions(userHistory);
    setIsLoading(false);
  }, [session]);

  // Click-to-Copy Handler
  const handleCopyTxnId = (txnId: string) => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxnId(txnId);
    showToast(`Copied Transaction ID: ${txnId}`);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  // Filtered List
  const filteredList = userTransactions.filter((txn) => {
    const matchesSearch =
      txn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || txn.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Financial Metrics
  const totalSpent = userTransactions
    .filter((t) => (t.type === "purchase" || t.type === "upgrade") && t.paymentStatus === "succeeded")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEarned = userTransactions
    .filter((t) => t.type === "payout" && t.paymentStatus === "succeeded")
    .reduce((acc, t) => acc + t.amount, 0);

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading your payment history...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">You must be logged in to view your payment history.</p>
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
      {/* Toast Notification */}
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
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-emerald-500" />
            <span>My Transactions Ledger</span>
          </h1>
        </div>

        <Link href="/recipes" className="no-underline">
          <Button
            variant="primary"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 ambient-glow-orange shadow-emerald-500/20 border-none cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Recipes</span>
          </Button>
        </Link>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Spent */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Total Spent
            </span>
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">${totalSpent.toFixed(2)}</span>
            <p className="text-xs text-default-400 mt-1">Purchases & Membership Fees</p>
          </div>
        </motion.div>

        {/* Card 2: Total Earned */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Chef Sales Earned
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalEarned.toFixed(2)}
            </span>
            <p className="text-xs text-default-400 mt-1">Stripe Payout Royalties</p>
          </div>
        </motion.div>

        {/* Card 3: Security & Verification */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Payment Gateway
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <span>Stripe Secured 256-Bit</span>
            </span>
            <p className="text-xs text-default-400 mt-1">Encrypted Checkout & Webhooks</p>
          </div>
        </motion.div>
      </div>

      {/* SEARCH BAR & STATUS FILTER */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search transactions by item title or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-default-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 px-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* USER TRANSACTIONS TABLE */}
      {paginatedList.length > 0 ? (
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
                    <th className="px-6 py-4">Transaction Item</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedList.map((txn) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                    >
                      {/* Column 1: Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          {txn.type === "upgrade" && <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />}
                          {txn.type === "purchase" && <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />}
                          {txn.type === "payout" && <DollarSign className="h-4 w-4 text-primary shrink-0" />}
                          <span className="font-extrabold text-foreground text-xs">{txn.title}</span>
                        </div>
                      </td>

                      {/* Column 2: Type Chip */}
                      <td className="px-6 py-4">
                        <Chip
                          color={txn.type === "upgrade" ? "warning" : txn.type === "payout" ? "success" : "accent"}
                          variant="soft"
                          size="sm"
                          className="font-bold text-[10px] uppercase"
                        >
                          {txn.type}
                        </Chip>
                      </td>

                      {/* Column 3: Amount */}
                      <td className="px-6 py-4 font-extrabold text-sm text-foreground">
                        ${txn.amount.toFixed(2)}
                      </td>

                      {/* Column 4: Date */}
                      <td className="px-6 py-4 text-xs text-default-400 font-medium">
                        {new Date(txn.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Column 5: Status Badges */}
                      <td className="px-6 py-4 text-center">
                        {txn.paymentStatus === "succeeded" && (
                          <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1 inline text-emerald-500" />
                            Succeeded
                          </Chip>
                        )}
                        {txn.paymentStatus === "failed" && (
                          <Chip color="danger" variant="soft" size="sm" className="font-extrabold text-[10px]">
                            <XCircle className="h-3 w-3 mr-1 inline text-rose-500" />
                            Failed
                          </Chip>
                        )}
                        {txn.paymentStatus === "pending" && (
                          <Chip color="warning" variant="soft" size="sm" className="font-extrabold text-[10px]">
                            <Clock className="h-3 w-3 mr-1 inline text-amber-500" />
                            Pending
                          </Chip>
                        )}
                      </td>

                      {/* Column 6: Micro-interaction Copy Transaction ID */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCopyTxnId(txn.transactionId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default-200 dark:border-zinc-800 bg-default-50 dark:bg-zinc-900 hover:bg-default-100 font-mono text-[11px] font-semibold text-default-600 dark:text-default-300 transition-all cursor-pointer"
                          title="Click to copy Transaction ID"
                        >
                          <span>{txn.transactionId}</span>
                          {copiedTxnId === txn.transactionId ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-default-400 group-hover:text-foreground" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HeroUI-styled Pagination Control (capped strictly at 10 per page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length} items
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
        <EmptyState
          icon={Receipt}
          variant="emerald"
          title={searchTerm ? "No Matching Transactions" : "No Payment Logs Yet"}
          description={
            searchTerm
              ? "No transactions matched your search input. Try clearing your search filters."
              : "When you purchase premium recipes or receive royalty payouts, your transaction logs will display here."
          }
          actionLabel="Explore Recipes"
          actionLink="/recipes"
        />
      )}
    </div>
  );
}
