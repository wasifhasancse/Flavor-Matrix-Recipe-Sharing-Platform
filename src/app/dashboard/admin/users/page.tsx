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
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Sparkles,
  Shield,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  RefreshCw,
  DollarSign,
  Calendar,
  X,
  Eye,
} from "lucide-react";
import { UserSchema } from "@/types/database";
import { EmptyState } from "@/components/shared/EmptyState";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

const ITEMS_PER_PAGE = 10;

export interface AggregatedUserItem extends UserSchema {
  totalMoneySpent?: number;
}

// Seed Initial Mock Users Data with aggregated Total Money Spent
const MOCK_USERS: AggregatedUserItem[] = [
  {
    id: "usr-1",
    _id: "usr-1",
    name: "Chef Luigi Carbonara",
    email: "luigi@carbonara.it",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
    role: "user",
    isBlocked: false,
    isPremium: true,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    totalMoneySpent: 44.97,
  },
  {
    id: "usr-2",
    _id: "usr-2",
    name: "Sarah Baker",
    email: "sarah@sweetlava.com",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    role: "user",
    isBlocked: false,
    isPremium: true,
    createdAt: "2026-02-14T15:30:00.000Z",
    updatedAt: "2026-02-14T15:30:00.000Z",
    totalMoneySpent: 24.98,
  },
  {
    id: "usr-3",
    _id: "usr-3",
    name: "Elena Gomez",
    email: "elena@crispyavocados.mx",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    role: "user",
    isBlocked: false,
    isPremium: false,
    createdAt: "2026-03-01T08:15:00.000Z",
    updatedAt: "2026-03-01T08:15:00.000Z",
    totalMoneySpent: 9.98,
  },
  {
    id: "usr-4",
    _id: "usr-4",
    name: "Nalee Siriporn",
    email: "nalee@green-curry.th",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    role: "user",
    isBlocked: false,
    isPremium: true,
    createdAt: "2026-03-20T11:45:00.000Z",
    updatedAt: "2026-03-20T11:45:00.000Z",
    totalMoneySpent: 64.95,
  },
  {
    id: "usr-5",
    _id: "usr-5",
    name: "John Spammer",
    email: "john@doe.com",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    role: "user",
    isBlocked: true,
    isPremium: false,
    createdAt: "2026-04-05T19:00:00.000Z",
    updatedAt: "2026-04-05T19:00:00.000Z",
    totalMoneySpent: 0.0,
  },
  {
    id: "usr-6",
    _id: "usr-6",
    name: "Admin Chief Operator",
    email: "admin@flavormatrix.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    role: "admin",
    isBlocked: false,
    isPremium: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    totalMoneySpent: 120.0,
  },
];

export default function AdminUsersPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [usersList, setUsersList] = useState<AggregatedUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Users Data
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users) {
          setUsersList(data.users);
        } else {
          showToast(data.error || "Failed to load users");
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        showToast("Error loading users");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Optimistic UI Toggle Block Status Mutation
  const handleToggleBlockStatus = async (userId: string, currentBlockedState: boolean) => {
    const nextBlockedState = !currentBlockedState;

    // Optimistic Update
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: nextBlockedState } : u))
    );

    // Sync with Backend endpoint
    try {
      const fetchRes = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: nextBlockedState }),
      });
      
      const result = await fetchRes.json();
      if (!fetchRes.ok || !result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      showToast(
        nextBlockedState
          ? "User access blocked successfully!"
          : "User account unblocked successfully!"
      );
    } catch (err: any) {
      // Revert if error
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: currentBlockedState } : u))
      );
      showToast(err.message || "Failed to update user status");
    }
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  // Filter Computation
  const filteredUsers = usersList.filter((usr) => {
    const matchesSearch =
      usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "premium" && usr.isPremium) ||
      (roleFilter === "admin" && usr.role === "admin") ||
      (roleFilter === "blocked" && usr.isBlocked);

    return matchesSearch && matchesRole;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading user management matrix...</p>
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
        <p className="text-default-500">Administrator privileges are required to manage users.</p>
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
            <Users className="h-7 w-7 text-primary" />
            <span>User Management & Financial Portal</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="accent" variant="soft" className="font-extrabold text-xs">
            {usersList.length} Accounts Registered
          </Chip>
        </div>
      </div>

      {/* SEARCH BAR & ROLE FILTER TOOLBAR */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Server-Side & Client Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
          />
        </div>

        {/* Role & Account Filter Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-default-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 px-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="all">All User Accounts</option>
            <option value="premium">Premium Members</option>
            <option value="admin">System Administrators</option>
            <option value="blocked">Blocked Users Only</option>
          </select>

          {(searchTerm || roleFilter !== "all") && (
            <Button
              
              size="sm"
              onClick={handleClearFilters}
              className="btn-secondary text-xs font-bold rounded-2xl border border-default-200 dark:border-zinc-800 cursor-pointer"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* HEROUI RESPONSIVE USER AGGREGATION TABLE */}
      {paginatedUsers.length > 0 ? (
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
                    <th className="px-6 py-4">User Profile</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-6 py-4 text-center">Subscription Tier</th>
                    <th className="px-6 py-4 text-center">Account Status</th>
                    <th className="px-6 py-4 text-center">Total Money Spent</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedUsers.map((usr, idx) => (
                    <tr
                      key={`${usr.id || (usr as any)._id}-${idx}`}
                      className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                    >
                      {/* Column 1: User Profile (Avatar, Name, Email) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar.Root className="w-10 h-10 rounded-full border-2 border-primary/20 shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shadow-sm">
                            <Avatar.Image src={usr.image || ""} alt={usr.name} />
                            <Avatar.Fallback>{usr.name.charAt(0).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          <div className="flex flex-col truncate max-w-[200px]">
                            <span className="font-extrabold text-foreground truncate text-xs">
                              {usr.name}
                            </span>
                            <span className="text-[11px] text-default-400 truncate">{usr.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Creation Date */}
                      <td className="px-6 py-4 text-xs text-default-400 font-medium">
                        {usr.createdAt
                          ? new Date(usr.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Jan 10, 2026"}
                      </td>

                      {/* Column 3: Role Badge */}
                      <td className="px-6 py-4 text-center">
                        <Chip
                          color={usr.role === "admin" ? "danger" : "default"}
                          variant="soft"
                          size="sm"
                          className="font-extrabold uppercase text-[10px]"
                        >
                          {usr.role}
                        </Chip>
                      </td>

                      {/* Column 4: Premium Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {usr.isPremium ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 shadow-sm">
                            <Sparkles className="h-3 w-3 fill-amber-400" />
                            <span>PREMIUM</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-default-100 dark:bg-zinc-800 text-default-500 inline-block">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Column 5: Block Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {usr.isBlocked ? (
                          <Chip color="danger" variant="soft" size="sm" className="font-extrabold text-[10px]">
                            Blocked
                          </Chip>
                        ) : (
                          <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
                            Active
                          </Chip>
                        )}
                      </td>

                      {/* Column 6: Total Money Spent ($ dollars) */}
                      <td className="px-6 py-4 text-center font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        ${(usr.totalMoneySpent || 0).toFixed(2)}
                      </td>

                      {/* Column 7: Block / Unblock Action Button Toggle */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          onPress={() => handleToggleBlockStatus(usr.id || usr._id || "", usr.isBlocked)}
                          variant="outline"
                          className={`py-1.5 px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                            usr.isBlocked
                              ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                              : "border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          }`}
                        >
                          {usr.isBlocked ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          <span>{usr.isBlocked ? "Unblock User" : "Block User"}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HeroUI Server-side Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} user accounts
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
        /* Empty State Component */
        <EmptyState
          icon={Users}
          variant="primary"
          title="No Matching User Accounts"
          description="No user accounts matched your search criteria or role filters. Clear your filters to view all user records."
          actionLabel="Clear Search Filters"
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
}
