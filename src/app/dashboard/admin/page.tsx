"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Link } from "@heroui/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
  X
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
}

// Visual Chart Mock Data
const uploadTrendData = [
  { name: "Jan", uploads: 12 },
  { name: "Feb", uploads: 28 },
  { name: "Mar", uploads: 19 },
  { name: "Apr", uploads: 45 },
  { name: "May", uploads: 32 },
  { name: "Jun", uploads: 61 },
  { name: "Jul", uploads: 88 }
];

const categoryDistributionData = [
  { name: "Italian", count: 4 },
  { name: "Asian", count: 3 },
  { name: "Mexican", count: 5 },
  { name: "Desserts", count: 6 },
  { name: "Seafood", count: 2 },
  { name: "Salads", count: 1 },
  { name: "Soups", count: 2 }
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
    
    // Merge recipes, keeping user's overrides if any
    const merged = [...userRecipes, ...mockRecipes];
    setAllRecipes(merged);

    // 2. Initialize mock users list in state/local storage
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
        { id: "usr-6", name: "Admin Chief", email: "admin@flavormatrix.com", isPremium: true, isBlocked: false, role: "admin" }
      ];
      localStorage.setItem(usersKey, JSON.stringify(defaultUsers));
      setUsersList(defaultUsers);
    }

    // 3. Initialize mock reports list in state/local storage
    const reportsKey = `admin_mock_reports`;
    const storedReports = localStorage.getItem(reportsKey);
    if (storedReports) {
      setReportsList(JSON.parse(storedReports));
    } else {
      const defaultReports: MockReport[] = [
        { id: "rep-1", recipeId: "rec-1", recipeTitle: "Classic Spaghetti Carbonara", reportedBy: "john@doe.com", reason: "spam", status: "pending" },
        { id: "rep-2", recipeId: "rec-3", recipeTitle: "Crispy Avocado Tacos", reportedBy: "luigi@carbonara.it", reason: "copyright", status: "pending" },
        { id: "rep-3", recipeId: "rec-6", recipeTitle: "Fresh Greek Mezze Salad", reportedBy: "sarah@sweetlava.com", reason: "offensive", status: "resolved" }
      ];
      localStorage.setItem(reportsKey, JSON.stringify(defaultReports));
      setReportsList(defaultReports);
    }
  }, [session]);

  // Action: Block/Unblock User
  const toggleBlockUser = (userId: string) => {
    const updated = usersList.map((u) =>
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    );
    setUsersList(updated);
    localStorage.setItem(`admin_mock_users`, JSON.stringify(updated));
  };

  // Action: Toggle Featured Recipe
  const toggleFeaturedRecipe = (recipeId: string) => {
    // 1. Update state
    const updated = allRecipes.map((r) =>
      r.id === recipeId ? { ...r, isFeatured: !r.isFeatured } : r
    );
    setAllRecipes(updated);

    // 2. Persist back to created user recipes if it was a user recipe
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

  // Action: Delete Recipe
  const handleDeleteRecipe = (recipeId: string) => {
    if (!confirm("Are you sure you want to permanently delete this recipe?")) return;

    // 1. Filter out from allRecipes state
    const updated = allRecipes.filter((r) => r.id !== recipeId);
    setAllRecipes(updated);

    // 2. Update created user recipes in localStorage if applicable
    if (recipeId.startsWith("user-rec-") && session?.user) {
      const userRecipesKey = `created_recipes_${session.user.id}`;
      const userRecipes = localStorage.getItem(userRecipesKey)
        ? JSON.parse(localStorage.getItem(userRecipesKey)!)
        : [];
      const updatedUser = userRecipes.filter((r: Recipe) => r.id !== recipeId);
      localStorage.setItem(userRecipesKey, JSON.stringify(updatedUser));
    }

    // 3. Remove corresponding reports if any
    const updatedReports = reportsList.filter((r) => r.recipeId !== recipeId);
    setReportsList(updatedReports);
    localStorage.setItem(`admin_mock_reports`, JSON.stringify(updatedReports));
  };

  // Action: Resolve Report
  const resolveReport = (reportId: string) => {
    const updated = reportsList.map((r) =>
      r.id === reportId ? { ...r, status: "resolved" as const } : r
    );
    setReportsList(updated);
    localStorage.setItem(`admin_mock_reports`, JSON.stringify(updated));
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Checking authorization...</p>
      </div>
    );
  }

  // Admin access validation mockup
  const isAdmin = session?.user?.email === "admin@flavormatrix.com" || usersList.find((u) => u.email === session?.user?.email)?.role === "admin";

  if (!session || !isAdmin) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-danger animate-pulse" />
        <h1 className="text-2xl font-bold text-foreground">Admin Console Restricted</h1>
        <p className="text-default-500">
          You must be logged in as an administrator to access these analytical and moderation panels.
        </p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg shadow-md">
            Login as Admin
          </Button>
        </Link>
      </div>
    );
  }

  // Count aggregates
  const totalUsers = usersList.length;
  const premiumUsers = usersList.filter((u) => u.isPremium).length;
  const pendingReports = reportsList.filter((r) => r.status === "pending").length;

  return (
    <div className="flex-grow flex flex-col lg:flex-row bg-background">
      
      {/* Sidebar Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800">
        <span className="font-bold text-sm text-foreground">Admin Panel</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-default-500 hover:text-foreground"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full lg:w-64 bg-default-50/50 dark:bg-zinc-900/20 border-r border-default-100 dark:border-zinc-800 flex flex-col gap-6 p-6 shrink-0 lg:block ${
          isSidebarOpen ? "block absolute inset-x-0 z-40 bg-background h-full" : "hidden"
        }`}
      >
        {/* Admin Card */}
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-danger/20 text-danger flex items-center justify-center font-bold text-sm ring-2 ring-danger/30">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[10px] text-danger font-bold tracking-wider">ADMINISTRATOR</span>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {[
            { label: "Console Overview", icon: LayoutDashboard, tab: "overview" },
            { label: "User Management", icon: Users, tab: "users" },
            { label: "Recipe Approval", icon: BookOpen, tab: "recipes" },
            { label: "Moderation Reports", icon: Flag, tab: "reports" }
          ].map((item) => {
            const isSelected = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                  isSelected
                    ? "bg-danger text-white font-bold shadow-md shadow-danger/10"
                    : "text-default-600 hover:bg-default-50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 max-w-5xl w-full mx-auto">
        
        {/* 1. OVERVIEW TAB (Analytics) */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Console Overview</h2>

            {/* Aggregates Card list */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { title: "Total Users", count: totalUsers, icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
                { title: "Active Recipes", count: allRecipes.length, icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                { title: "Premium Tier", count: premiumUsers, icon: Star, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
                { title: "Pending Reports", count: pendingReports, icon: Flag, color: "text-danger bg-danger/10 border-danger/20" }
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-default-500">{stat.title}</span>
                    <span className={`p-1.5 rounded-lg border ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-foreground mt-1">{stat.count}</span>
                </div>
              ))}
            </div>

            {/* Recharts Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Area Chart: Upload Trend */}
              <div className="p-5 rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm flex flex-col gap-4">
                <span className="font-bold text-xs uppercase tracking-wider text-default-500">Recipe Uploads Trend</span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uploadTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                      <Area type="monotone" dataKey="uploads" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Category Distribution */}
              <div className="p-5 rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm flex flex-col gap-4">
                <span className="font-bold text-xs uppercase tracking-wider text-default-500">Category Spread Distribution</span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT TAB */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
            <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Tier</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-default-200 text-default-600 font-bold flex items-center justify-center text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.isPremium ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 uppercase border border-amber-500/25">Premium</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-default-150 text-default-500 uppercase">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger/15 text-danger uppercase">Blocked</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role === "admin" ? (
                          <span className="text-xs text-default-400 font-semibold px-2">Protected</span>
                        ) : (
                          <Button
                            onPress={() => toggleBlockUser(user.id)}
                            variant="outline"
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 inline-flex transition-colors border ${
                              user.isBlocked
                                ? "bg-success/10 border-success/20 text-success hover:bg-success/20"
                                : "bg-danger/10 border-danger/20 text-danger hover:bg-danger/20"
                            }`}
                          >
                            {user.isBlocked ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                <span>Block</span>
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RECIPE APPROVAL / MANAGEMENT TAB */}
        {activeTab === "recipes" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Recipe Inventory Management</h2>
            <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Recipe</th>
                    <th className="px-6 py-3.5">Author</th>
                    <th className="px-6 py-3.5">Tier</th>
                    <th className="px-6 py-3.5 text-center">Featured</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                  {allRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={recipe.image} alt="" className="h-8 w-11 rounded object-cover border" />
                        <span className="font-bold text-foreground truncate max-w-[180px]">{recipe.title}</span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[120px]">{recipe.author}</td>
                      <td className="px-6 py-4">
                        {(recipe.price || 0) > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning-600 uppercase border border-warning/25">Premium</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-default-150 text-default-500 uppercase">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeaturedRecipe(recipe.id)}
                          className="hover:scale-110 transition-transform"
                          title="Toggle featured status"
                        >
                          <Star className={`h-4.5 w-4.5 mx-auto ${recipe.isFeatured ? "fill-amber-500 text-amber-500" : "text-default-300"}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2.5 justify-end">
                          <Link href={`/recipes/${recipe.id}`} className="p-1.5 rounded-lg border text-default-500 hover:text-foreground hover:bg-default-50 transition-colors">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="p-1.5 rounded-lg border border-danger/10 hover:border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                            title="Delete Recipe"
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
        )}

        {/* 4. MODERATION REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Flagged Moderation Reports</h2>
            {reportsList.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Recipe Title</th>
                      <th className="px-6 py-3.5">Reported By</th>
                      <th className="px-6 py-3.5">Reason</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                    {reportsList.map((rep) => (
                      <tr key={rep.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[150px]">{rep.recipeTitle}</td>
                        <td className="px-6 py-4 truncate max-w-[150px]">{rep.reportedBy}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rep.reason === "spam"
                              ? "bg-default-150 text-default-600"
                              : rep.reason === "offensive"
                              ? "bg-danger/15 text-danger"
                              : "bg-warning/15 text-warning-600"
                          }`}>
                            {rep.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {rep.status === "resolved" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success uppercase">Resolved</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger/15 text-danger uppercase animate-pulse">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end items-center">
                            {rep.status === "pending" && (
                              <Button
                                onPress={() => resolveReport(rep.id)}
                                variant="outline"
                                className="py-1 px-2.5 rounded-lg border border-success/20 text-success hover:bg-success/5 text-xs font-semibold inline-flex items-center gap-1"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Dismiss</span>
                              </Button>
                            )}
                            <Button
                              onPress={() => handleDeleteRecipe(rep.recipeId)}
                              variant="outline"
                              className="py-1 px-2.5 rounded-lg border border-danger/20 text-danger hover:bg-danger/5 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove Recipe</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-2xl flex flex-col items-center gap-4">
                <span className="text-3xl">🛡️</span>
                <h3 className="font-bold text-foreground">Clean Moderation Queue</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  There are no pending reports in the queue. Flavor Matrix is completely safe.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading administrator console...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
