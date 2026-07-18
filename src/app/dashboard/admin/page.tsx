"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  Shield,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  Star,
  Trash2,
  CheckCircle,
  Eye,
  AlertTriangle,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

type TabType = "overview" | "users" | "recipes" | "reports";

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

// Visual Chart Mock Data for Growth Trajectory (Users & Recipes)
const growthTrajectoryData = [
  { month: "Jan", users: 180, recipes: 42 },
  { month: "Feb", users: 320, recipes: 85 },
  { month: "Mar", users: 490, recipes: 130 },
  { month: "Apr", users: 710, recipes: 210 },
  { month: "May", users: 890, recipes: 290 },
  { month: "Jun", users: 1120, recipes: 380 },
  { month: "Jul", users: 1280, recipes: 450 },
];

// Platform Health Breakdown Data (Reports by Reason)
const reportHealthData = [
  { name: "Spam / Unrelated", value: 45, color: "#f59e0b" },
  { name: "Offensive Content", value: 35, color: "#f43f5e" },
  { name: "Copyright Issue", value: 20, color: "#a855f7" },
];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "overview";

  const { data: session, isPending } = authClient.useSession();

  // States
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [usersList, setUsersList] = useState<MockUser[]>([]);
  const [reportsList, setReportsList] = useState<MockReport[]>([]);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.push(`/dashboard/admin?${params.toString()}`);
  };

  // Hydrate lists
  useEffect(() => {
    if (!session?.user) return;

    // 1. Gather all recipes (mockRecipes + local created user recipes)
    const userRecipesKey = `created_recipes_${session.user.id}`;
    const storedUser = localStorage.getItem(userRecipesKey);
    const userRecipes = storedUser ? JSON.parse(storedUser) : [];

    const merged = [...userRecipes, ...mockRecipes];
    setAllRecipes(merged);

    // 2. Initialize mock users list
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

    // 3. Initialize mock reports list
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

  // Action: Block/Unblock User
  const toggleBlockUser = (userId: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    setUsersList(updated);
    localStorage.setItem(`admin_mock_users`, JSON.stringify(updated));
  };

  // Action: Toggle Featured Recipe
  const toggleFeaturedRecipe = (recipeId: string) => {
    const updated = allRecipes.map((r) => (r.id === recipeId ? { ...r, isFeatured: !r.isFeatured } : r));
    setAllRecipes(updated);

    if (recipeId.startsWith("user-rec-") && session?.user) {
      const userRecipesKey = `created_recipes_${session.user.id}`;
      const storedUser = localStorage.getItem(userRecipesKey);
      const userRecipes = storedUser ? JSON.parse(storedUser) : [];
      const updatedUser = userRecipes.map((r: Recipe) =>
        r.id === recipeId ? { ...r, isFeatured: !r.isFeatured } : r
      );
      localStorage.setItem(userRecipesKey, JSON.stringify(updatedUser));
    }
  };

  // Delete Modal state
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isAdminDeleteOpen, setIsAdminDeleteOpen] = useState<boolean>(false);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState<boolean>(false);

  const openDeleteModal = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setIsAdminDeleteOpen(true);
  };

  const confirmAdminDelete = () => {
    if (!recipeToDelete) return;
    setIsDeletingAdmin(true);
    setTimeout(() => {
      const updated = allRecipes.filter((r) => r.id !== recipeToDelete.id);
      setAllRecipes(updated);
      setIsDeletingAdmin(false);
      setIsAdminDeleteOpen(false);
      setRecipeToDelete(null);
    }, 600);
  };

  // Action: Resolve Moderation Report
  const resolveReport = (reportId: string) => {
    const updated = reportsList.map((rep) =>
      rep.id === reportId ? { ...rep, status: "resolved" as const } : rep
    );
    setReportsList(updated);
    localStorage.setItem(`admin_mock_reports`, JSON.stringify(updated));
  };

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
    <div className="flex-grow flex flex-col lg:flex-row bg-background min-h-screen">
      {/* Sidebar Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800">
        <span className="font-bold text-sm text-foreground">Admin Console</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-default-500 hover:text-foreground cursor-pointer">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full lg:w-64 bg-default-50/50 dark:bg-zinc-900/40 border-r border-default-100 dark:border-zinc-800 flex flex-col gap-6 p-6 shrink-0 lg:block ${
          isSidebarOpen ? "block fixed inset-0 z-40 bg-background h-full" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center font-bold shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[10px] text-danger font-extrabold tracking-wider uppercase">System Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {[
            { label: "Overview", icon: LayoutDashboard, tab: "overview" },
            { label: "User Management", icon: Users, tab: "users" },
            { label: "Recipe Approvals", icon: BookOpen, tab: "recipes" },
            { label: "Moderation Reports", icon: Flag, tab: "reports" },
          ].map((item) => {
            const isSelected = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                  isSelected
                    ? "bg-danger text-white shadow-md shadow-danger/20 font-bold"
                    : "text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Transactions Direct Link */}
        <Link href="/dashboard/admin/transactions" className="no-underline">
          <Button
            variant="outline"
            className="w-full font-bold text-xs py-2.5 rounded-xl border border-default-200 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer hover:bg-default-100 dark:hover:bg-zinc-800"
          >
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>Transaction Logs</span>
          </Button>
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 max-w-6xl w-full mx-auto">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                <LayoutDashboard className="h-7 w-7 text-danger" />
                <span>Administrative Console Overview</span>
              </h1>
              <p className="text-xs text-default-400">Real-time system metrics, analytics & moderation highlights</p>
            </div>

            {/* CORE METRICS GRID (5 High-Impact Stat Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Stat 1: Total Users */}
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3">
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

              {/* Stat 2: Total Recipes */}
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3">
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

              {/* Stat 3: Premium Members */}
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3">
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

              {/* Stat 4: Reports */}
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3">
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

              {/* Stat 5: Gross Revenue */}
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-3">
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

            {/* ADVANCED RECHARTS ANALYTICS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Dual-Axis Line/Composed Chart: User Growth & Recipes Trajectory */}
              <div className="lg:col-span-8 p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-4">
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

              {/* Donut Chart: Report Health Breakdown */}
              <div className="lg:col-span-4 p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-4">
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

                {/* Legend List */}
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

            {/* ADMIN QUICK LINKS & RECENT REPORTS SNAPSHOT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Reports Snapshot */}
              <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-danger" />
                      <span>Recent Moderation Reports</span>
                    </h3>
                    <span className="text-xs text-default-400">Latest flagged recipes needing review</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleTabChange("reports")}
                    className="text-xs font-bold py-1.5 px-3 rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    View All
                  </Button>
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
                        <tr key={rep.id} className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTabChange("reports")}
                              className="font-bold text-[10px] py-1 px-2.5 rounded-lg border border-default-200 dark:border-zinc-800 cursor-pointer"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Quick Links Panel */}
              <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-5">
                <div className="flex flex-col border-b border-default-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-base text-foreground">Quick Action Shortcuts</h3>
                  <span className="text-xs text-default-400">Fast access to admin tools</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleTabChange("users")}
                    className="p-4 rounded-2xl border border-default-200 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-950 hover:bg-primary/5 hover:border-primary/40 transition-all flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">Block / Unblock Users</span>
                        <span className="text-[10px] text-default-400">Manage user access & roles</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-default-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleTabChange("recipes")}
                    className="p-4 rounded-2xl border border-default-200 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-950 hover:bg-amber-500/5 hover:border-amber-500/40 transition-all flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <Star className="h-4.5 w-4.5 fill-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">Feature a Recipe</span>
                        <span className="text-[10px] text-default-400">Promote top chef creations</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-default-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link href="/dashboard/admin/transactions" className="no-underline">
                    <div className="p-4 rounded-2xl border border-default-200 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-950 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                          <CreditCard className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground">View Transaction Logs</span>
                          <span className="text-[10px] text-default-400">Check Stripe payment ledgers</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-default-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  <button
                    onClick={() => handleTabChange("reports")}
                    className="p-4 rounded-2xl border border-default-200 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-950 hover:bg-rose-500/5 hover:border-rose-500/40 transition-all flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                        <Flag className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">Moderation Reports Queue</span>
                        <span className="text-[10px] text-default-400">Dismiss or purge flagged recipes</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-default-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. USER MANAGEMENT TAB */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
            <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-center">Subscription Tier</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                            {usr.name.charAt(0)}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-foreground">{usr.name}</span>
                            <span className="text-xs text-default-400">{usr.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-xs capitalize">{usr.role}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {usr.isPremium ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30 inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3 fill-amber-400" /> Premium
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-default-100 dark:bg-zinc-800 text-default-500 inline-block">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {usr.isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 inline-block">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 inline-block">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onPress={() => toggleBlockUser(usr.id)}
                          variant="outline"
                          className={`py-1.5 px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                            usr.isBlocked
                              ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                              : "border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          }`}
                        >
                          {usr.isBlocked ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          <span>{usr.isBlocked ? "Unblock" : "Block"}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RECIPE APPROVAL & MANAGEMENT TAB */}
        {activeTab === "recipes" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Recipe Approval & Inventory</h2>
            <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Recipe</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Featured Badge</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {allRecipes.map((rcp) => (
                    <tr key={rcp.id} className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={rcp.image} alt={rcp.title} className="h-10 w-12 rounded-xl object-cover border border-default-100 shrink-0" />
                          <div className="flex flex-col truncate max-w-[200px]">
                            <span className="font-bold text-foreground truncate">{rcp.title}</span>
                            <span className="text-xs text-default-400">{rcp.author || "User"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{rcp.category}</td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          onPress={() => toggleFeaturedRecipe(rcp.id)}
                          variant="outline"
                          className={`py-1 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                            rcp.isFeatured
                              ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                              : "border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${rcp.isFeatured ? "fill-amber-500" : ""}`} />
                          <span>{rcp.isFeatured ? "Featured" : "Promote"}</span>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/recipes/${rcp.id}`} className="p-2 rounded-xl border border-default-200 text-default-500 hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button onClick={() => openDeleteModal(rcp)} className="p-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 cursor-pointer">
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
        )}

        {/* 4. MODERATION REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Moderation Reports Queue</h2>
            <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Reported Recipe</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {reportsList.map((rep) => (
                    <tr key={rep.id} className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{rep.recipeTitle}</td>
                      <td className="px-6 py-4 text-xs text-default-400">{rep.reportedBy}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {rep.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rep.status === "pending" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Pending
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Resolved
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rep.status === "pending" && (
                            <Button
                              onPress={() => resolveReport(rep.id)}
                              variant="outline"
                              className="py-1 px-2.5 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Dismiss</span>
                            </Button>
                          )}
                          <Button
                            onPress={() => {
                              const target = allRecipes.find((r) => r.id === rep.recipeId) || ({
                                id: rep.recipeId,
                                title: rep.recipeTitle || "Reported Item",
                                category: "Reported Dish",
                                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                                author: "User",
                              } as Recipe);
                              openDeleteModal(target);
                            }}
                            variant="outline"
                            className="py-1 px-2.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
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
        )}
      </main>

      {/* CUSTOM ADMIN DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isAdminDeleteOpen && recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminDeleteOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-default-100 dark:border-zinc-800 shadow-2xl flex flex-col gap-6 z-10"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-foreground">Purge Recipe Post</h3>
                  <span className="text-xs text-rose-500 font-semibold">Administrative Purge Action</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 flex items-center gap-3">
                {recipeToDelete.image && (
                  <img src={recipeToDelete.image} alt={recipeToDelete.title} className="h-12 w-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-xs text-foreground truncate">{recipeToDelete.title}</span>
                  <span className="text-[10px] text-default-400 uppercase tracking-wider">{recipeToDelete.category}</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                Are you sure you want to permanently purge this recipe from the system? This administrative action cannot be undone.
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdminDeleteOpen(false)}
                  isDisabled={isDeletingAdmin}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmAdminDelete}
                  isDisabled={isDeletingAdmin}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                >
                  {isDeletingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purge Recipe"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-danger animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading console...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
