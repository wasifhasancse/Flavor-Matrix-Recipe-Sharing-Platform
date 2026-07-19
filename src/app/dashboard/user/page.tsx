"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Heart,
  Eye,
  Loader2,
  Lock,
  ArrowDownToLine,
  Activity,
  Award,
  Calendar,
  DollarSign,
  Star,
  ShoppingBag,
  PlusCircle,
  Compass,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  Layers,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

// Custom Disclosure Hook for Modal state control
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);
  return { isOpen, onOpen, onClose, onToggle, onOpenChange: setIsOpen };
}

export interface EngagementDataPoint {
  month: string;
  likes: number;
  views: number;
  revenue: number;
}

export interface CategoryDataPoint {
  name: string;
  count: number;
  fill: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: "like" | "favorite" | "publish" | "purchase" | "payout" | "sale";
  timestamp: string;
  recipeTitle?: string;
  amount?: string;
}

const SAMPLE_ENGAGEMENT_DATA: EngagementDataPoint[] = [
  { month: "Jan", likes: 24, views: 140, revenue: 15 },
  { month: "Feb", likes: 38, views: 220, revenue: 28 },
  { month: "Mar", likes: 45, views: 310, revenue: 36 },
  { month: "Apr", likes: 62, views: 430, revenue: 48 },
  { month: "May", likes: 89, views: 580, revenue: 64 },
  { month: "Jun", likes: 110, views: 720, revenue: 85 },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-0",
    title: "Sold 1 copy of Spicy Thai Green Curry",
    recipeTitle: "Spicy Thai Green Curry",
    type: "sale",
    amount: "+$4.99",
    timestamp: "8 minutes ago",
  },
  {
    id: "act-1",
    title: "Community member liked your recipe",
    recipeTitle: "Classic Spaghetti Carbonara",
    type: "like",
    timestamp: "12 minutes ago",
  },
  {
    id: "act-2",
    title: "Saved new recipe bookmark to favorites",
    recipeTitle: "Spicy Thai Green Curry",
    type: "favorite",
    timestamp: "2 hours ago",
  },
  {
    id: "act-3",
    title: "Unlocked Premium Recipe Access",
    recipeTitle: "Decadent Chocolate Lava Cake",
    type: "purchase",
    timestamp: "Yesterday at 4:30 PM",
  },
  {
    id: "act-4",
    title: "Published new culinary creation",
    recipeTitle: "Crispy Golden Avocado Tacos",
    type: "publish",
    timestamp: "3 days ago",
  },
];

function DashboardContent() {
  const { data: session, isPending } = authClient.useSession();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  const [totalSalesCount, setTotalSalesCount] = useState<number>(14);
  const [totalEarned, setTotalEarned] = useState<number>(59.86);
  const [availableBalance, setAvailableBalance] = useState<number>(47.88);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Withdraw Money Modal State
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("47.88");
  const [withdrawMethod, setWithdrawMethod] = useState<string>("stripe");
  const [payoutAccount, setPayoutAccount] = useState<string>("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);
  const [withdrawRef, setWithdrawRef] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      const createdKey = `created_recipes_${session.user.id}`;
      const stored = localStorage.getItem(createdKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMyRecipes(parsed);
      } else {
        const seed = mockRecipes.slice(0, 2);
        setMyRecipes(seed);
        localStorage.setItem(createdKey, JSON.stringify(seed));
      }
    }
  }, [session]);

  const togglePremiumMembership = () => {
    setIsPremiumUser(true);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !payoutAccount) return;
    setIsSubmittingWithdrawal(true);
    setTimeout(() => {
      setAvailableBalance(0);
      setWithdrawRef(`TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
      setIsSubmittingWithdrawal(false);
      setWithdrawSuccess(true);
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: "Processed Earnings Payout",
        type: "payout",
        amount: `-$${withdrawAmount}`,
        timestamp: "Just now",
      };
      setActivityFeed((prev) => [newActivity, ...prev]);
    }, 1400);
  };

  if (!isMounted) return null;
  if (!session?.user) return null;

  const maxFreeRecipes = 2;
  const recipesCount = myRecipes.length;
  const recipeProgressPercent = Math.min((recipesCount / maxFreeRecipes) * 100, 100);

  const categoryCounts = myRecipes.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors = ["#f97316", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"];
  const categoryChartData: CategoryDataPoint[] = Object.keys(categoryCounts).map((cat, idx) => ({
    name: cat,
    count: categoryCounts[cat],
    fill: categoryColors[idx % categoryColors.length],
  }));

  const displayCategoryData: CategoryDataPoint[] =
    categoryChartData.length > 0
      ? categoryChartData
      : [
          { name: "Italian", count: 3, fill: "#f97316" },
          { name: "Asian", count: 2, fill: "#10b981" },
          { name: "Mexican", count: 1, fill: "#3b82f6" },
          { name: "Desserts", count: 4, fill: "#ec4899" },
        ];

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <span>Dashboard Overview</span>
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-8"
      >
        {/* Dynamic Profile Header & Withdraw CTA */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar.Root className="w-16 h-16 rounded-2xl border-2 border-primary/30 shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-xl text-primary shadow-md">
                <Avatar.Image src={session.user.image || ""} alt={session.user.name || "User"} />
                <Avatar.Fallback>{session.user.name?.charAt(0).toUpperCase() || "U"}</Avatar.Fallback>
              </Avatar.Root>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Welcome, {session.user.name}!
                  </h1>
                  {isPremiumUser && <Award className="h-5 w-5 text-amber-500" />}
                </div>
                <p className="text-xs text-default-400 flex items-center gap-2">
                  <span>{session.user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since 2026
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Button
                variant="primary"
                onClick={onWithdrawOpen}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 ambient-glow-orange shadow-emerald-500/20 border-none cursor-pointer hover:scale-105 transition-all"
              >
                <ArrowDownToLine className="h-4 w-4" />
                <span>Withdraw Money (${availableBalance.toFixed(2)})</span>
              </Button>

              {isPremiumUser ? (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                    Premium Chef
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={togglePremiumMembership}
                  className="border border-amber-500/40 text-amber-500 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500/10 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upgrade Account</span>
                </Button>
              )}
            </div>
          </div>

          {!isPremiumUser && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Standard Account Limit: {recipesCount} of {maxFreeRecipes} Free Recipes Created</span>
              </div>
              <div className="w-full sm:w-48 h-2 bg-amber-500/20 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-amber-500 rounded-full transition-smooth"
                  style={{ width: `${recipeProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-default-400">My Recipes</span>
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-foreground">{recipesCount}</span>
                <p className="text-[10px] text-default-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Published creations
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-default-400">Recipes Sold</span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-foreground">{totalSalesCount} <span className="text-xl font-semibold text-default-400">Sales</span></span>
                <p className="text-[10px] text-default-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Stripe verified purchases
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-default-400">Gross Earnings</span>
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-foreground">${totalEarned.toFixed(2)}</span>
                <p className="text-[10px] text-default-400 mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Lifetime recipe revenue
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/20 flex flex-col justify-between gap-4 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Available Balance</span>
                <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                  <ArrowDownToLine className="h-5 w-5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">${availableBalance.toFixed(2)}</span>
                <button onClick={onWithdrawOpen} className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1 flex items-center gap-1 font-bold hover:underline cursor-pointer">
                  Withdraw Money Now <ArrowDownToLine className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6">
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-blue-500" />
                  <span>Monthly Engagement & Sales Revenue</span>
                </h3>
                <span className="text-xs text-default-400">Month-over-month views, likes, and revenue ($)</span>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SAMPLE_ENGAGEMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-default-200 dark:text-zinc-800" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor" }} className="text-default-400" dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor" }} className="text-default-400" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "rgba(24, 24, 27, 0.9)", border: "1px solid rgba(63, 63, 70, 0.5)", borderRadius: "12px", color: "#fff", fontSize: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      itemStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="likes" name="Likes" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLikes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6">
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-orange-500" />
                  <span>Category Breakdown</span>
                </h3>
                <span className="text-xs text-default-400">Recipes across culinary styles</span>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayCategoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-default-200 dark:text-zinc-800" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor", fontWeight: 600 }} className="text-foreground" width={70} />
                    <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ backgroundColor: "rgba(24, 24, 27, 0.9)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                      {displayCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6">
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  <span>Quick Actions</span>
                </h3>
                <span className="text-xs text-default-400">Jump right into your next task</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/user/add-recipe" className="no-underline">
                  <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group flex flex-col gap-2 cursor-pointer">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-smooth">Create Recipe</span>
                    <span className="text-xs text-default-400">Draft a new culinary masterpiece</span>
                  </div>
                </Link>
                <Link href="/dashboard/user/my-recipes" className="no-underline">
                  <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group flex flex-col gap-2 cursor-pointer">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-smooth">Manage Portfolio</span>
                    <span className="text-xs text-default-400">Edit or update your published recipes</span>
                  </div>
                </Link>
                <Link href="/dashboard/user/analytics" className="no-underline">
                  <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group flex flex-col gap-2 cursor-pointer">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-smooth">View Analytics</span>
                    <span className="text-xs text-default-400">Deep dive into your recipe performance</span>
                  </div>
                </Link>
                <Link href="/recipes" className="no-underline">
                  <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group flex flex-col gap-2 cursor-pointer">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Compass className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-purple-500 transition-smooth">Browse Catalog</span>
                    <span className="text-xs text-default-400">Explore community dishes</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Recent Activity Feed</span>
                  </h3>
                  <span className="text-xs text-default-400">Your latest platform interactions</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative pl-2">
                <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-default-200 dark:bg-zinc-800" />
                {activityFeed.map((act) => (
                  <div key={act.id} className="flex items-start gap-4 relative z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${act.type === "sale" ? "bg-emerald-500 text-white border-emerald-500" : act.type === "payout" ? "bg-teal-500 text-white border-teal-500" : act.type === "like" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : act.type === "favorite" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                      {act.type === "sale" && <DollarSign className="h-4 w-4" />}
                      {act.type === "payout" && <ArrowDownToLine className="h-4 w-4" />}
                      {act.type === "like" && <Heart className="h-3.5 w-3.5 fill-rose-500" />}
                      {act.type === "favorite" && <Star className="h-3.5 w-3.5 fill-amber-500" />}
                      {act.type === "publish" && <PlusCircle className="h-3.5 w-3.5" />}
                      {act.type === "purchase" && <ShoppingBag className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{act.title}</span>
                        {act.amount && (
                          <span className={`text-xs font-extrabold ${act.type === "payout" ? "text-rose-500" : "text-emerald-500"}`}>
                            {act.amount}
                          </span>
                        )}
                      </div>
                      {act.recipeTitle && (
                        <span className="text-xs text-primary font-semibold">&ldquo;{act.recipeTitle}&rdquo;</span>
                      )}
                      <span className="text-[10px] text-default-400">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>


      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onWithdrawClose} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col gap-6">
              {!withdrawSuccess ? (
                <>
                  <div className="flex justify-between items-center pb-4 border-b border-default-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-foreground">Withdraw Earnings</h2>
                    <button onClick={onWithdrawClose} className="p-2 text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-zinc-800 rounded-full transition-smooth cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleWithdrawalSubmit} className="flex flex-col gap-5">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Available Balance</span>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">${availableBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-default-500">Amount to Withdraw (USD)</label>
                      <input type="number" step="0.01" max={availableBalance} min="5" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-medium" required />
                      <span className="text-[10px] text-default-400">Minimum withdrawal: $5.00</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-default-500">Payout Account Email / Stripe ID</label>
                      <input type="text" placeholder="e.g. chef@example.com" value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-white dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-emerald-500 outline-none text-foreground font-medium" required />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={onWithdrawClose} isDisabled={isSubmittingWithdrawal} className="font-semibold text-xs rounded-xl px-5 py-2.5 border border-default-200 dark:border-zinc-800 cursor-pointer">
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" isDisabled={isSubmittingWithdrawal || availableBalance < 5} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl px-6 py-2.5 flex items-center gap-2 shadow-md shadow-emerald-500/20 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmittingWithdrawal ? <Loader2 className="h-4 w-4 animate-spin" /> : <> <ArrowDownToLine className="h-4 w-4" /> <span>Confirm Payout</span> </>}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                  <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">Withdrawal Successful!</h2>
                  <p className="text-sm text-default-500 max-w-[250px]">Your funds are on the way. The transfer will appear in your account within 2-3 business days.</p>
                  <div className="mt-2 p-3 bg-default-100 dark:bg-zinc-800 rounded-xl border border-default-200 dark:border-zinc-700">
                    <span className="text-[10px] text-default-400 font-medium uppercase tracking-wider block mb-1">Transaction Ref</span>
                    <span className="text-sm font-mono font-bold text-foreground">{withdrawRef}</span>
                  </div>
                  <Button variant="primary" onClick={onWithdrawClose} className="mt-4 w-full bg-default-200 hover:bg-default-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold px-6 py-3 rounded-xl border-none cursor-pointer">
                    Close Window
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
