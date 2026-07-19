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
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Star,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Lock,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { mockRecipes } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

// Sample Monthly Trajectory
const MONTHLY_GROWTH_DATA = [
  { month: "Jan", views: 420, likes: 85, recipes: 2 },
  { month: "Feb", views: 680, likes: 140, recipes: 4 },
  { month: "Mar", views: 950, likes: 210, recipes: 5 },
  { month: "Apr", views: 1350, likes: 310, recipes: 7 },
  { month: "May", views: 1800, likes: 430, recipes: 9 },
  { month: "Jun", views: 2400, likes: 580, recipes: 12 },
];

export default function UserAnalyticsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Author Metrics State
  const [analyticsData, setAnalyticsData] = useState<{
    totalPublished: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
    recipePerformance: { title: string; views: number; likes: number; rating: number }[];
    monthlyGrowth: typeof MONTHLY_GROWTH_DATA;
  }>({
    totalPublished: 6,
    totalViews: 7600,
    totalLikes: 1755,
    averageRating: 4.8,
    recipePerformance: [],
    monthlyGrowth: MONTHLY_GROWTH_DATA,
  });

  useEffect(() => {
    setIsLoading(true);
    // Compute author metrics from mockRecipes & session
    const authorRecipes = mockRecipes.slice(0, 6);
    const perf = authorRecipes.map((r) => ({
      title: r.title.length > 15 ? `${r.title.slice(0, 14)}...` : r.title,
      likes: r.likes || 120,
      views: Math.floor((r.likes || 120) * 4.2),
      rating: 4.7 + Math.random() * 0.3,
    }));

    const totLikes = perf.reduce((acc, curr) => acc + curr.likes, 0);
    const totViews = perf.reduce((acc, curr) => acc + curr.views, 0);

    setAnalyticsData({
      totalPublished: perf.length,
      totalViews: totViews,
      totalLikes: totLikes,
      averageRating: 4.9,
      recipePerformance: perf,
      monthlyGrowth: MONTHLY_GROWTH_DATA,
    });

    setIsLoading(false);
  }, [session]);

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading your recipe performance analytics...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Authentication Required</h1>
        <p className="text-default-500">Sign in to view your culinary author performance dashboard.</p>
        <Link href="/login" className="no-underline">
          <Button  className="btn-primary  text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">

          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-primary" />
            <span>Author Recipe Analytics Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="accent" variant="soft" className="font-extrabold text-xs">
            Performance Insights Active
          </Chip>
        </div>
      </div>

      {/* CORE METRICS GRID (HEROUI STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Total Published Recipes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                Published Recipes
              </span>
              <span className="text-3xl font-extrabold text-foreground mt-1">
                {analyticsData.totalPublished}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+2 new recipes this month</span>
          </div>
        </motion.div>

        {/* Stat 2: Total Views */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                Total Views
              </span>
              <span className="text-3xl font-extrabold text-foreground mt-1">
                {analyticsData.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+34% view growth trajectory</span>
          </div>
        </motion.div>

        {/* Stat 3: Total Likes Received */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                Likes Received
              </span>
              <span className="text-3xl font-extrabold text-foreground mt-1">
                {analyticsData.totalLikes.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Heart className="h-6 w-6 fill-rose-500/20" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+28% engagement rate</span>
          </div>
        </motion.div>

        {/* Stat 4: Average Recipe Rating */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                Average Rating
              </span>
              <span className="text-3xl font-extrabold text-foreground mt-1">
                {analyticsData.averageRating} / 5.0
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Top 5% Rated Chef</span>
          </div>
        </motion.div>
      </div>

      {/* RECHARTS VISUALIZATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual 1: Recipe Performance BarChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-extrabold text-foreground">Recipe Performance Breakdown</h3>
            <span className="text-xs text-default-400">Total views & likes per published recipe</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.recipePerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="title" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 24, 0.9)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Views" />
                <Bar dataKey="likes" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Likes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Visual 2: Monthly Engagement AreaChart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-extrabold text-foreground">Monthly Engagement Trajectory</h3>
            <span className="text-xs text-default-400">Audience reach & interaction trend line over time</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.monthlyGrowth}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 24, 0.9)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" name="Views Trajectory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
