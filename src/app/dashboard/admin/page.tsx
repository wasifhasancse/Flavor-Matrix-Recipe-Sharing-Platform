"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  Sparkles,
  Loader2,
  Lock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  isPremium: boolean;
  isBlocked: boolean;
  role: "admin" | "user";
}

interface MockReport {
  id: string;
  recipeId: string;
  recipeTitle: string;
  reportedBy: string;
  reason: "spam" | "offensive" | "copyright";
  status: "pending" | "resolved";
  createdAt?: string;
}

const growthTrajectoryData = [
  { month: "Jan", users: 180, recipes: 42 },
  { month: "Feb", users: 320, recipes: 85 },
  { month: "Mar", users: 490, recipes: 130 },
  { month: "Apr", users: 710, recipes: 210 },
  { month: "May", users: 890, recipes: 290 },
  { month: "Jun", users: 1120, recipes: 380 },
  { month: "Jul", users: 1280, recipes: 450 },
];

const reportHealthData = [
  { name: "Spam / Unrelated", value: 45, color: "#f59e0b" },
  { name: "Offensive Content", value: 35, color: "#f43f5e" },
  { name: "Copyright Issue", value: 20, color: "#a855f7" },
];

function AdminDashboardContent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [usersList, setUsersList] = useState<MockUser[]>([]);
  const [reportsList, setReportsList] = useState<MockReport[]>([]);

  useEffect(() => {
    if (!session?.user) return;

    const userRecipesKey = `created_recipes_${session.user.id}`;
    const storedUser = localStorage.getItem(userRecipesKey);
    const userRecipes = storedUser ? JSON.parse(storedUser) : [];

    const merged = [...userRecipes, ...mockRecipes];
    setAllRecipes(merged);

    const usersKey = `admin_mock_users`;
    const storedUsers = localStorage.getItem(usersKey);
    if (storedUsers) {
      setUsersList(JSON.parse(storedUsers));
    } else {
      const defaultUsers: MockUser[] = [
        { id: "usr-1", name: "Chef Luigi", email: "luigi@carbonara.it", isPremium: true, isBlocked: false, role: "user" },
        { id: "usr-2", name: "Sarah Baker", email: "sarah@sweetlava.com", isPremium: true, isBlocked: false, role: "user" },
        { id: "usr-3", name: "Elena Gomez", email: "elena@crispyavocados.mx", isPremium: false, isBlocked: false, role: "user" },
        { id: "usr-4", name: "Nalee Siriporn", email: "nalee@green-curry.th", isPremium: true, isBlocked: false, role: "user" },
        { id: "usr-5", name: "John Doe", email: "john@doe.com", isPremium: false, isBlocked: true, role: "user" },
        { id: "usr-6", name: "Admin Chief", email: "admin@flavormatrix.com", isPremium: true, isBlocked: false, role: "admin" },
      ];
      localStorage.setItem(usersKey, JSON.stringify(defaultUsers));
      setUsersList(defaultUsers);
    }

    const reportsKey = `admin_mock_reports`;
    const storedReports = localStorage.getItem(reportsKey);
    if (storedReports) {
      setReportsList(JSON.parse(storedReports));
    } else {
      const defaultReports: MockReport[] = [
        { id: "rep-1", recipeId: "rec-1", recipeTitle: "Classic Spaghetti Carbonara", reportedBy: "john@doe.com", reason: "spam", status: "pending", createdAt: "2026-07-18" },
        { id: "rep-2", recipeId: "rec-3", recipeTitle: "Crispy Avocado Tacos", reportedBy: "luigi@carbonara.it", reason: "copyright", status: "pending", createdAt: "2026-07-17" },
        { id: "rep-3", recipeId: "rec-6", recipeTitle: "Fresh Greek Mezze Salad", reportedBy: "sarah@sweetlava.com", reason: "offensive", status: "resolved", createdAt: "2026-07-16" },
        { id: "rep-4", recipeId: "rec-4", recipeTitle: "Matcha Lava Cake", reportedBy: "elena@crispyavocados.mx", reason: "spam", status: "pending", createdAt: "2026-07-15" },
        { id: "rep-5", recipeId: "rec-2", recipeTitle: "Truffle Mushroom Risotto", reportedBy: "nalee@green-curry.th", reason: "copyright", status: "resolved", createdAt: "2026-07-14" },
      ];
      localStorage.setItem(reportsKey, JSON.stringify(defaultReports));
      setReportsList(defaultReports);
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-danger animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading Administrator Console...</p>
      </div>
    );
  }

  const isAdmin =
    session?.user?.email === "admin@flavormatrix.com" ||
    usersList.find((u) => u.email === session?.user?.email)?.role === "admin";

  if (!session || !isAdmin) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-danger animate-pulse" />
        <h1 className="text-2xl font-bold text-foreground">Admin Console Restricted</h1>
        <p className="text-default-500">
          You must be logged in as an administrator to access these analytical and moderation panels.
        </p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Login as Admin
          </Button>
        </Link>
      </div>
    );
  }

  const totalUsers = usersList.length || 1280;
  const premiumUsers = usersList.filter((u) => u.isPremium).length || 142;
  const totalReports = reportsList.length || 18;
  const totalGrossRevenue = 14890.5;

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <span>Administrative Console Overview</span>
          </h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-default-400">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-foreground">{totalUsers}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>+14.2% MoM</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-default-400">Total Recipes</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-foreground">{allRecipes.length}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>+8.5% MoM</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-default-400">Premium Tier</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-foreground">{premiumUsers}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                <TrendingUp className="h-3 w-3" />
                <span>+22.1% MoM</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-default-400">Moderation</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Flag className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-foreground">{totalReports}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingDown className="h-3 w-3" />
                <span>-5.3% down</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-default-400">Gross Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-foreground">${totalGrossRevenue.toFixed(0)}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>+18.4% MoM</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-base text-foreground">Monthly Platform Growth</h3>
                <span className="text-xs text-default-400">User registrations vs recipes published</span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthTrajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.85)", border: "none", borderRadius: "12px", fontSize: "11px", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  <Line type="monotone" dataKey="recipes" name="Recipes Published" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="font-extrabold text-base text-foreground">Moderation Health</h3>
              <span className="text-xs text-default-400">Reports distribution by reason</span>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportHealthData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {reportHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.85)", border: "none", borderRadius: "12px", fontSize: "11px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-default-100 dark:border-zinc-800">
              {reportHealthData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-default-500">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-danger" />
                  <span>Recent Moderation Reports</span>
                </h3>
                <span className="text-xs text-default-400">Latest flagged recipes needing review</span>
              </div>

              <Link href="/dashboard/admin/reports">
                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  View All
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-xs">
                <thead className="text-left font-bold text-default-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="pb-3">Reported Recipe</th>
                    <th className="pb-3">Reporter</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {reportsList.slice(0, 5).map((rep) => (
                    <tr key={rep.id} className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth">
                      <td className="py-3.5 font-extrabold">{rep.recipeTitle}</td>
                      <td className="py-3.5 text-default-400 truncate max-w-[140px]">{rep.reportedBy}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {rep.reason}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                            rep.status === "pending"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link href="/dashboard/admin/reports">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-[10px] py-1 px-2.5 rounded-lg border border-default-200 dark:border-zinc-800 cursor-pointer"
                          >
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-danger animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading Administrator Console...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
