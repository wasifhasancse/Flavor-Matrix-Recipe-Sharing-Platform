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
  ShieldAlert,
  ShieldCheck,
  Flag,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Filter,
  FileText,
  User,
  X,
  Check,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockRecipes } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

const ITEMS_PER_PAGE = 10;

// Aggregated Report Item Interface
export interface AggregatedReportItem {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  authorName: string;
  authorEmail: string;
  reportCount: number;
  primaryReason: "spam" | "offensive" | "copyright";
  reasons?: string[];
  latestReportAt?: string;
}

// Single Report Detail Interface
export interface ReportDetailItem {
  id: string;
  recipeId: string;
  reporterEmail: string;
  reason: "spam" | "offensive" | "copyright";
  createdAt: string;
}

// Seed Initial Aggregated Reports
const INITIAL_AGGREGATED_REPORTS: AggregatedReportItem[] = [
  {
    recipeId: "rec-1",
    recipeName: "Classic Spaghetti Carbonara",
    recipeImage: mockRecipes[0]?.image || "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
    authorName: mockRecipes[0]?.author || "Chef Luigi",
    authorEmail: "luigi@carbonara.it",
    reportCount: 4,
    primaryReason: "spam",
    reasons: ["spam", "spam", "offensive", "copyright"],
    latestReportAt: "2026-07-18T14:00:00.000Z",
  },
  {
    recipeId: "rec-3",
    recipeName: "Crispy Avocado Tacos",
    recipeImage: mockRecipes[2]?.image || "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    authorName: mockRecipes[2]?.author || "Elena Gomez",
    authorEmail: "elena@crispyavocados.mx",
    reportCount: 2,
    primaryReason: "copyright",
    reasons: ["copyright", "spam"],
    latestReportAt: "2026-07-17T18:30:00.000Z",
  },
  {
    recipeId: "rec-4",
    recipeName: "Matcha Lava Cake",
    recipeImage: mockRecipes[3]?.image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    authorName: mockRecipes[3]?.author || "Sarah Baker",
    authorEmail: "sarah@sweetlava.com",
    reportCount: 1,
    primaryReason: "offensive",
    reasons: ["offensive"],
    latestReportAt: "2026-07-16T09:15:00.000Z",
  },
];

// Seed Sample Report Details
const SAMPLE_DETAILS: Record<string, ReportDetailItem[]> = {
  "rec-1": [
    { id: "det-1", recipeId: "rec-1", reporterEmail: "john@doe.com", reason: "spam", createdAt: "2026-07-18T14:00:00.000Z" },
    { id: "det-2", recipeId: "rec-1", reporterEmail: "sam.foodie@example.com", reason: "spam", createdAt: "2026-07-18T12:30:00.000Z" },
    { id: "det-3", recipeId: "rec-1", reporterEmail: "maria.s@example.com", reason: "offensive", createdAt: "2026-07-17T20:10:00.000Z" },
    { id: "det-4", recipeId: "rec-1", reporterEmail: "alex.gourmet@example.com", reason: "copyright", createdAt: "2026-07-16T15:45:00.000Z" },
  ],
  "rec-3": [
    { id: "det-5", recipeId: "rec-3", reporterEmail: "luigi@carbonara.it", reason: "copyright", createdAt: "2026-07-17T18:30:00.000Z" },
    { id: "det-6", recipeId: "rec-3", reporterEmail: "nalee@green-curry.th", reason: "spam", createdAt: "2026-07-17T10:00:00.000Z" },
  ],
  "rec-4": [
    { id: "det-7", recipeId: "rec-4", reporterEmail: "elena@crispyavocados.mx", reason: "offensive", createdAt: "2026-07-16T09:15:00.000Z" },
  ],
};

export default function AdminReportsPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [reportsQueue, setReportsQueue] = useState<AggregatedReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reasonFilter, setReasonFilter] = useState<string>("all");

  // View Details Modal State
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<AggregatedReportItem | null>(null);
  const [detailsList, setDetailsList] = useState<ReportDetailItem[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(false);

  // Dismiss Modal State
  const [recipeToDismiss, setRecipeToDismiss] = useState<AggregatedReportItem | null>(null);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState<boolean>(false);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  // Delete Cascade Modal State
  const [recipeToDelete, setRecipeToDelete] = useState<AggregatedReportItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Aggregated Reports Queue
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem("admin_aggregated_reports");
    if (stored) {
      setReportsQueue(JSON.parse(stored));
    } else {
      setReportsQueue(INITIAL_AGGREGATED_REPORTS);
      localStorage.setItem("admin_aggregated_reports", JSON.stringify(INITIAL_AGGREGATED_REPORTS));
    }
    setIsLoading(false);
  }, []);

  // Action: Open Details Modal & Fetch Sub-table Data
  const handleOpenDetails = async (reportItem: AggregatedReportItem) => {
    setSelectedRecipeForDetails(reportItem);
    setIsDetailsModalOpen(true);
    setIsFetchingDetails(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/admin/reports/${reportItem.recipeId}/details`);
      const data = await res.json();
      if (data.details && data.details.length > 0) {
        setDetailsList(data.details);
      } else {
        setDetailsList(SAMPLE_DETAILS[reportItem.recipeId] || []);
      }
    } catch {
      setDetailsList(SAMPLE_DETAILS[reportItem.recipeId] || []);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Action: Confirm Dismiss Reports
  const handleConfirmDismiss = async () => {
    if (!recipeToDismiss) return;
    setIsDismissing(true);

    setTimeout(() => {
      const updated = reportsQueue.filter((r) => r.recipeId !== recipeToDismiss.recipeId);
      setReportsQueue(updated);
      localStorage.setItem("admin_aggregated_reports", JSON.stringify(updated));

      // Call Backend API
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      fetch(`${baseUrl}/api/admin/reports/${recipeToDismiss.recipeId}/dismiss`, {
        method: "PATCH",
      }).catch(() => {});

      setIsDismissing(false);
      setIsDismissModalOpen(false);
      setRecipeToDismiss(null);
      showToast("Reports linked to this recipe have been dismissed!");
    }, 600);
  };

  // Action: Confirm Cascading Delete Recipe
  const handleConfirmCascadingDelete = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);

    setTimeout(() => {
      const updated = reportsQueue.filter((r) => r.recipeId !== recipeToDelete.recipeId);
      setReportsQueue(updated);
      localStorage.setItem("admin_aggregated_reports", JSON.stringify(updated));

      // Call Backend Cascading DELETE API
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      fetch(`${baseUrl}/api/admin/recipes/${recipeToDelete.recipeId}`, {
        method: "DELETE",
      }).catch(() => {});

      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
      showToast("Recipe permanently purged and all associated report documents wiped!");
    }, 700);
  };

  // Filtering Computation
  const filteredQueue = reportsQueue.filter((r) => {
    if (reasonFilter === "all") return true;
    return r.primaryReason.toLowerCase() === reasonFilter.toLowerCase();
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredQueue.length / ITEMS_PER_PAGE) || 1;
  const paginatedReports = filteredQueue.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-danger animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading moderation queue...</p>
      </div>
    );
  }

  // Admin Security Guard
  const isAdmin = session?.user && (session.user as any).role === "admin";
  if (!session || !isAdmin) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-danger" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">Administrator privileges are required for moderation panels.</p>
        <Link href="/login" className="no-underline">
          <Button  className="btn-primary  text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Sign In as Admin
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
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
            <ShieldAlert className="h-7 w-7 text-danger" />
            <span>Recipe Reports Moderation Queue</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="danger" variant="soft" className="font-extrabold text-xs">
            {reportsQueue.length} Active Flagged Items
          </Chip>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-default-400 shrink-0" />
          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-60 px-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-danger outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="all">All Violation Reasons</option>
            <option value="spam">Spam / Unrelated</option>
            <option value="offensive">Offensive Content</option>
            <option value="copyright">Copyright Issue</option>
          </select>
        </div>
      </div>

      {/* HEROUI RESPONSIVE AGGREGATED REPORTS TABLE */}
      {paginatedReports.length > 0 ? (
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
                    <th className="px-6 py-4">Target Recipe</th>
                    <th className="px-6 py-4">Author Info</th>
                    <th className="px-6 py-4 text-center">Total Reports</th>
                    <th className="px-6 py-4 text-center">Primary Reason</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedReports.map((item) => (
                    <tr
                      key={item.recipeId}
                      className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                    >
                      {/* Column 1: Target Recipe Preview */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.recipeImage}
                            alt={item.recipeName}
                            className="h-12 w-16 rounded-2xl object-cover border border-default-100 dark:border-zinc-800 shadow-sm shrink-0"
                          />
                          <div className="flex flex-col truncate max-w-[220px]">
                            <span className="font-extrabold text-foreground truncate text-xs">
                              {item.recipeName}
                            </span>
                            <span className="text-[10px] text-default-400 truncate">ID: {item.recipeId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Author Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar.Root className="w-6 h-6 rounded-full border bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                            <Avatar.Fallback>{item.authorName.charAt(0).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          <div className="flex flex-col truncate max-w-[160px]">
                            <span className="font-bold text-xs text-foreground truncate">{item.authorName}</span>
                            <span className="text-[10px] text-default-400 truncate">{item.authorEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Total Reports Count Badge (Intensified Colors) */}
                      <td className="px-6 py-4 text-center">
                        <Chip
                          color={item.reportCount >= 3 ? "danger" : "warning"}
                          variant="soft"
                          size="sm"
                          className="font-extrabold text-xs"
                        >
                          <Flag className="h-3 w-3 mr-1 inline" />
                          {item.reportCount} {item.reportCount === 1 ? "Report" : "Reports"}
                        </Chip>
                      </td>

                      {/* Column 4: Primary Violation Reason */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-block">
                          {item.primaryReason}
                        </span>
                      </td>

                      {/* Column 5: Moderation Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. View Details Button */}
                          <Button
                            
                            size="sm"
                            className="btn-secondary" onClick={() => handleOpenDetails(item)}
                            className="font-bold text-xs py-1.5 px-3 rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </Button>

                          {/* 2. Dismiss Reports Button */}
                          <Button
                            
                            size="sm"
                            className="btn-secondary" onClick={() => {
                              setRecipeToDismiss(item);
                              setIsDismissModalOpen(true);
                            }}
                            className="font-bold text-xs py-1.5 px-3 rounded-xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Dismiss</span>
                          </Button>

                          {/* 3. Remove Recipe Cascading Button */}
                          <Button
                            
                            size="sm"
                            className="btn-secondary" onClick={() => {
                              setRecipeToDelete(item);
                              setIsDeleteModalOpen(true);
                            }}
                            className="font-bold text-xs py-1.5 px-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HeroUI Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredQueue.length)} of {filteredQueue.length} flagged items
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  
                  size="sm"
                  isDisabled={currentPage === 1}
                  className="btn-secondary" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                          ? "bg-danger text-white shadow-md shadow-danger/20"
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
                  className="btn-secondary" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Reusable Structured Empty State Component */
        <EmptyState
          icon={ShieldCheck}
          variant="emerald"
          title="Platform is Secure. No Pending Reports Found!"
          description="All reported items have been reviewed, resolved, or dismissed by system administrators."
          actionLabel="Return to Dashboard Overview"
          actionLink="/dashboard/admin"
        />
      )}

      {/* 1. VIEW REPORT DETAILS HEROUI MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedRecipeForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-danger/10 text-danger border border-danger/20">
                    <Flag className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-foreground">Report Submissions Details</h3>
                    <span className="text-xs text-default-400">
                      Recipe: &quot;{selectedRecipeForDetails.recipeName}&quot;
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sub-table of Reporters */}
              {isFetchingDetails ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-xs text-default-400 mt-2">Loading detailed submissions...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50">
                  <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-xs">
                    <thead className="bg-default-100/60 dark:bg-zinc-900 font-bold text-default-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 text-left">Reporter Email</th>
                        <th className="px-4 py-3 text-center">Specific Reason</th>
                        <th className="px-4 py-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                      {detailsList.map((det) => (
                        <tr key={det.id} className="hover:bg-default-100 dark:hover:bg-zinc-800 transition-smooth cursor-pointer">
                          <td className="px-4 py-3 font-semibold text-foreground truncate max-w-[180px]">
                            {det.reporterEmail}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {det.reason}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-default-400">
                            {new Date(det.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-2 border-t border-default-100 dark:border-zinc-800">
                <Button
                  
                  className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}
                  className="font-semibold text-xs rounded-xl px-5 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Close Window
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CONFIRM DISMISS REPORTS HEROUI MODAL */}
      <AnimatePresence>
        {isDismissModalOpen && recipeToDismiss && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDismissModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10"
            >
              <div className="flex items-center gap-3 text-emerald-500">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-foreground">Dismiss Moderation Flag</h3>
                  <span className="text-xs text-emerald-500 font-semibold">Keep Recipe & Resolve Flags</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                Dismissing will mark all pending reports for &quot;{recipeToDismiss.recipeName}&quot; as dismissed and remove it from the active moderation queue without deleting the recipe.
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  
                  className="btn-secondary" onClick={() => setIsDismissModalOpen(false)}
                  isDisabled={isDismissing}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  
                  onClick={handleConfirmDismiss}
                  isDisabled={isDismissing}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                >
                  {isDismissing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Dismissal"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. DESTRUCTIVE CASCADING DELETE HEROUI MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-foreground">Purge Recipe & Wipe Reports</h3>
                  <span className="text-xs text-rose-500 font-semibold">Cascading Deletion Action</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 flex items-center gap-3">
                <img
                  src={recipeToDelete.recipeImage}
                  alt={recipeToDelete.recipeName}
                  className="h-12 w-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-xs text-foreground truncate">{recipeToDelete.recipeName}</span>
                  <span className="text-[10px] text-default-400 truncate">Author: {recipeToDelete.authorName}</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                This will permanently delete the recipe document from the database AND wipe all associated report records to ensure data integrity.
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  
                  className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}
                  isDisabled={isDeleting}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  
                  onClick={handleConfirmCascadingDelete}
                  isDisabled={isDeleting}
                  className="btn-primary bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purge Recipe"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
