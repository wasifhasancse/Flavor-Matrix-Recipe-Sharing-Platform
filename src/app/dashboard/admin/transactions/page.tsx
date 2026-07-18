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
  DollarSign,
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
  TrendingUp,
  CreditCard,
  Shield,
  Loader2,
  Lock,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { PaymentSchema } from "@/types/database";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockRecipes } from "@/data/recipes";

const ITEMS_PER_PAGE = 10;

// Seed Mock Transactions matching PaymentSchema database architecture
const MOCK_TRANSACTIONS: PaymentSchema[] = [
  {
    id: "pay-1",
    _id: "pay-1",
    userEmail: "alex.gourmet@example.com",
    userId: "user-1",
    amount: 19.99,
    recipeId: "MEMBERSHIP_UPGRADE",
    transactionId: "txn_stripe_98a71b32x",
    paymentStatus: "succeeded",
    paidAt: "2026-07-18T14:30:00.000Z",
  },
  {
    id: "pay-2",
    _id: "pay-2",
    userEmail: "maria.s@example.com",
    userId: "user-2",
    amount: 4.99,
    recipeId: "rec-1",
    transactionId: "txn_stripe_44k29m01z",
    paymentStatus: "succeeded",
    paidAt: "2026-07-17T18:45:00.000Z",
  },
  {
    id: "pay-3",
    _id: "pay-3",
    userEmail: "david.chef@example.com",
    userId: "user-3",
    amount: 6.50,
    recipeId: "rec-2",
    transactionId: "txn_stripe_11x98q45p",
    paymentStatus: "failed",
    paidAt: "2026-07-16T11:20:00.000Z",
  },
  {
    id: "pay-4",
    _id: "pay-4",
    userEmail: "elena.r@example.com",
    userId: "user-4",
    amount: 19.99,
    recipeId: "MEMBERSHIP_UPGRADE",
    transactionId: "txn_stripe_88v43l90k",
    paymentStatus: "succeeded",
    paidAt: "2026-07-15T09:15:00.000Z",
  },
  {
    id: "pay-5",
    _id: "pay-5",
    userEmail: "sam.foodie@example.com",
    userId: "user-5",
    amount: 3.99,
    recipeId: "rec-3",
    transactionId: "txn_stripe_33m12o87u",
    paymentStatus: "pending",
    paidAt: "2026-07-14T20:10:00.000Z",
  },
  {
    id: "pay-6",
    _id: "pay-6",
    userEmail: "sophia.b@example.com",
    userId: "user-6",
    amount: 4.99,
    recipeId: "rec-4",
    transactionId: "txn_stripe_77b65w21a",
    paymentStatus: "succeeded",
    paidAt: "2026-07-13T16:00:00.000Z",
  },
];

export default function AdminTransactionsPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [transactions, setTransactions] = useState<PaymentSchema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search, Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Copy Transaction ID Micro-Interaction State
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Transactions Data
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem("admin_mock_payments");
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      setTransactions(MOCK_TRANSACTIONS);
      localStorage.setItem("admin_mock_payments", JSON.stringify(MOCK_TRANSACTIONS));
    }
    setIsLoading(false);
  }, []);

  // Refresh Transaction Data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      localStorage.setItem("admin_mock_payments", JSON.stringify(MOCK_TRANSACTIONS));
      setIsLoading(false);
      showToast("Transaction history refreshed!");
    }, 600);
  };

  // Copy Transaction ID to Clipboard
  const handleCopyTxnId = (txnId: string) => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxnId(txnId);
    showToast(`Copied Transaction ID: ${txnId}`);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  // Helper to map recipe title from recipeId
  const getRecipeTitle = (recipeId: string) => {
    if (recipeId === "MEMBERSHIP_UPGRADE") return "Lifetime Premium Upgrade";
    const found = mockRecipes.find((r) => r.id === recipeId);
    return found ? found.title : `Premium Recipe (${recipeId})`;
  };

  // Filtered Transactions Computation
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.recipeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || txn.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination Calculations (Capped strictly at 10 items per page)
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Financial Metrics Summaries
  const totalGrossRevenue = transactions
    .filter((t) => t.paymentStatus === "succeeded")
    .reduce((acc, t) => acc + t.amount, 0);

  const successfulCount = transactions.filter((t) => t.paymentStatus === "succeeded").length;
  const failedCount = transactions.filter((t) => t.paymentStatus === "failed").length;
  const pendingCount = transactions.filter((t) => t.paymentStatus === "pending").length;

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading transaction ledger...</p>
      </div>
    );
  }

  // Admin Security Guard
  const isAdmin = session?.user && (session.user as any).role === "admin";
  if (!session || !isAdmin) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">Administrator privileges are required to access financial ledgers.</p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Sign In as Admin
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 border border-emerald-500 shadow-xl flex items-center gap-3 text-xs font-bold text-white"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Refresh Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-default-400">
            <Link href="/dashboard/admin" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Transactions History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-emerald-500" />
            <span>Financial Transaction Ledger</span>
          </h1>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          className="border border-default-200 dark:border-zinc-800 text-foreground font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center gap-2 cursor-pointer hover:bg-default-100 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="h-4 w-4 text-emerald-500" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* QUICK FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Gross Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">
              ${totalGrossRevenue.toFixed(2)}
            </span>
            <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Succeeded Stripe payouts</span>
            </p>
          </div>
        </motion.div>

        {/* Card 2: Successful Transactions */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Successful Payouts
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{successfulCount} Paid</span>
            <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Verified transactions</span>
            </p>
          </div>
        </motion.div>

        {/* Card 3: Failed Attempts */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Failed Attempts
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{failedCount} Failed</span>
            <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Card decline / canceled</span>
            </p>
          </div>
        </motion.div>

        {/* Card 4: Pending Processing */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-default-400">
              Pending Processing
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-foreground">{pendingCount} Pending</span>
            <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Awaiting webhook confirmation</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* SEARCH & STATUS FILTER TOOLBAR */}
      <div className="p-4 sm:p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Real-Time Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search by User Email, Transaction ID, or Recipe..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-medium"
          />
        </div>

        {/* Status Filter Selector */}
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
            <option value="all">All Payment Statuses</option>
            <option value="succeeded">Succeeded Only</option>
            <option value="failed">Failed Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* FINANCIAL HISTORY DATA TABLE */}
      {paginatedTransactions.length > 0 ? (
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
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Product / Item</th>
                    <th className="px-6 py-4">Amount ($)</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedTransactions.map((txn) => (
                    <tr
                      key={txn.id || txn.transactionId}
                      className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Column 1: User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar.Root className="w-8 h-8 rounded-full border bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            <Avatar.Fallback>
                              {txn.userEmail.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <div className="flex flex-col truncate max-w-[180px]">
                            <span className="font-bold text-foreground text-xs truncate">
                              {txn.userEmail}
                            </span>
                            <span className="text-[10px] text-default-400">ID: {txn.userId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Product Reference */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {txn.recipeId === "MEMBERSHIP_UPGRADE" ? (
                            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                            {getRecipeTitle(txn.recipeId)}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Amount Paid */}
                      <td className="px-6 py-4 font-extrabold text-sm text-foreground">
                        ${txn.amount.toFixed(2)}
                      </td>

                      {/* Column 4: Date */}
                      <td className="px-6 py-4 text-xs text-default-400 font-medium">
                        {new Date(txn.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Column 5: Semantic Status Badges */}
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

                      {/* Column 6: Click-to-Copy Transaction ID */}
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

          {/* HeroUI-styled Pagination Bar (capped strictly at max 10 items per page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} records
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
        /* Structured Empty State Component */
        <EmptyState
          icon={Receipt}
          variant="emerald"
          title={searchTerm || statusFilter !== "all" ? "No Matching Transactions" : "No Transaction Logs"}
          description={
            searchTerm || statusFilter !== "all"
              ? "No financial transaction records matched your search query or status filter. Try resetting your search inputs."
              : "There are currently no financial payment logs registered in the Stripe ledger."
          }
          actionLabel="Refresh Transaction Data"
          onAction={handleRefresh}
        />
      )}
    </div>
  );
}
