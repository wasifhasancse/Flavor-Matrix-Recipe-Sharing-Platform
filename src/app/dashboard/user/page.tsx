"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
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
  Star,
  ShoppingBag,
  PlusCircle,
  Sparkles,
  Heart,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Lock,
  Upload,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Settings,
  Compass,
  Zap,
  Activity,
  Award,
  Calendar,
  Layers,
  DollarSign,
  Wallet,
  ArrowDownToLine,
  Building2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

type TabType = "overview" | "add-recipe" | "my-recipes" | "favorites" | "purchased";

// Custom Disclosure Hook for Modal state control
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);
  return { isOpen, onOpen, onClose, onToggle, onOpenChange: setIsOpen };
}

// Recharts Type Interfaces
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

// Sample Engagement & Revenue Trend Data
const SAMPLE_ENGAGEMENT_DATA: EngagementDataPoint[] = [
  { month: "Jan", likes: 24, views: 140, revenue: 15 },
  { month: "Feb", likes: 38, views: 220, revenue: 28 },
  { month: "Mar", likes: 45, views: 310, revenue: 36 },
  { month: "Apr", likes: 62, views: 430, revenue: 48 },
  { month: "May", likes: 89, views: 580, revenue: 64 },
  { month: "Jun", likes: 110, views: 720, revenue: 85 },
];

// Sample Recent Activity Data
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "overview";

  const { data: session, isPending } = authClient.useSession();

  // Tab & UI States
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Recipes & Membership Storage States
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [purchased, setPurchased] = useState<Recipe[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  // Chef Sales & Monetization Metrics
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

  // Form States
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Italian");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formPrep, setFormPrep] = useState("10 mins");
  const [formCook, setFormCook] = useState("15 mins");
  const [formIngredients, setFormIngredients] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Hydration Mount Guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync tab with URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setFormError(null);
    setFormSuccess(false);
    if (tab !== "add-recipe") {
      resetForm();
    }
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.push(`/dashboard/user?${params.toString()}`);
  };

  // Load user data from localStorage
  useEffect(() => {
    if (!session?.user) return;

    setPayoutAccount(session.user.email || "chef@example.com");

    // Created recipes
    const createdKey = `created_recipes_${session.user.id}`;
    const storedCreated = localStorage.getItem(createdKey);
    if (storedCreated) {
      setMyRecipes(JSON.parse(storedCreated));
    } else {
      const seeded = [mockRecipes[0]];
      setMyRecipes(seeded);
      localStorage.setItem(createdKey, JSON.stringify(seeded));
    }

    // Premium membership simulation
    const premiumKey = `is_premium_account_${session.user.id}`;
    const storedPremium = localStorage.getItem(premiumKey) === "true";
    setIsPremiumUser(storedPremium);

    // Purchased recipes
    const purchasedList = mockRecipes.filter(
      (r) => localStorage.getItem(`purchased_${r.id}`) === "true"
    );
    setPurchased(purchasedList);

    // Favorites list
    const favKey = `favorites_list_${session.user.id}`;
    const storedFav = localStorage.getItem(favKey);
    if (storedFav) {
      setFavorites(JSON.parse(storedFav));
    } else {
      const initialFavs = mockRecipes.slice(1, 3);
      localStorage.setItem(favKey, JSON.stringify(initialFavs));
      setFavorites(initialFavs);
    }
  }, [session]);

  // Toggle Premium Membership
  const togglePremiumMembership = () => {
    if (!session?.user) return;
    const premiumKey = `is_premium_account_${session.user.id}`;
    const nextState = !isPremiumUser;
    localStorage.setItem(premiumKey, String(nextState));
    setIsPremiumUser(nextState);
  };

  // Handle Withdraw Money Form Submission
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > availableBalance) {
      alert("Please enter a valid withdrawal amount up to your available balance.");
      return;
    }

    setIsSubmittingWithdrawal(true);

    setTimeout(() => {
      const refCode = `WDR-${Date.now().toString().slice(-6)}`;
      setWithdrawRef(refCode);
      const newBal = availableBalance - amountNum;
      setAvailableBalance(newBal);
      setIsSubmittingWithdrawal(false);
      setWithdrawSuccess(true);

      // Add to activity timeline
      const newActivity: ActivityItem = {
        id: `act-wdr-${Date.now()}`,
        title: `Requested payout withdrawal via ${withdrawMethod.toUpperCase()}`,
        amount: `-$${amountNum.toFixed(2)}`,
        type: "payout",
        timestamp: "Just now",
      };
      setActivityFeed((prev) => [newActivity, ...prev]);
    }, 1400);
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setUploadedImageUrl(
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
        );
      } else {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.data?.url) {
          setUploadedImageUrl(data.data.url);
        } else {
          setFormError("ImgBB upload failed. Please try again or paste an image URL.");
        }
      }
    } catch (err) {
      setFormError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Recipe Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setFormError(null);

    if (!editingRecipeId && !isPremiumUser && myRecipes.length >= 2) {
      setFormError(
        "Free Standard Accounts are limited to 2 published recipes. Upgrade to Premium for unlimited publishing!"
      );
      return;
    }

    if (!formTitle || !formDesc || !formIngredients || !formInstructions) {
      setFormError("Please complete all required recipe fields.");
      return;
    }

    const ingredientsArray = formIngredients
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    const instructionsArray = formInstructions
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const defaultImage = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

    const createdKey = `created_recipes_${session.user.id}`;
    let updatedRecipes = [...myRecipes];

    if (editingRecipeId) {
      updatedRecipes = updatedRecipes.map((r) =>
        r.id === editingRecipeId
          ? {
              ...r,
              title: formTitle,
              description: formDesc,
              category: formCategory,
              difficulty: formDifficulty,
              prepTime: formPrep,
              cookTime: formCook,
              ingredients: ingredientsArray,
              instructions: instructionsArray,
              image: uploadedImageUrl || r.image,
            }
          : r
      );
      setFormSuccess(true);
      setTimeout(() => {
        setMyRecipes(updatedRecipes);
        localStorage.setItem(createdKey, JSON.stringify(updatedRecipes));
        handleTabChange("my-recipes");
      }, 1000);
    } else {
      const newRecipe: Recipe = {
        id: `user-rec-${Date.now()}`,
        title: formTitle,
        description: formDesc,
        category: formCategory,
        difficulty: formDifficulty,
        prepTime: formPrep,
        cookTime: formCook,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        image: uploadedImageUrl || defaultImage,
        likes: 0,
        isFeatured: false,
        author: session.user.name || "Home Chef",
      };

      const finalRecipes = [newRecipe, ...updatedRecipes];
      setMyRecipes(finalRecipes);
      localStorage.setItem(createdKey, JSON.stringify(finalRecipes));
      setFormSuccess(true);
      setTimeout(() => {
        handleTabChange("my-recipes");
      }, 1000);
    }
  };

  const handleEditClick = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormTitle(recipe.title);
    setFormDesc(recipe.description);
    setFormCategory(recipe.category);
    setFormDifficulty(recipe.difficulty);
    setFormPrep(recipe.prepTime);
    setFormCook(recipe.cookTime);
    setFormIngredients(recipe.ingredients.join("\n"));
    setFormInstructions(recipe.instructions.join("\n"));
    setUploadedImageUrl(recipe.image);
    setActiveTab("add-recipe");
  };

  // Delete Recipe Modal State
  const deleteModal = useDisclosure(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeletingRecipe, setIsDeletingRecipe] = useState(false);

  const openDeleteModal = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    deleteModal.onOpen();
  };

  const handleConfirmDelete = () => {
    if (!recipeToDelete || !session?.user) return;
    setIsDeletingRecipe(true);

    setTimeout(() => {
      const createdKey = `created_recipes_${session.user.id}`;
      const updated = myRecipes.filter((r) => r.id !== recipeToDelete.id);
      setMyRecipes(updated);
      localStorage.setItem(createdKey, JSON.stringify(updated));

      setIsDeletingRecipe(false);
      deleteModal.onClose();
      setRecipeToDelete(null);
    }, 500);
  };

  const handleUnfavorite = (id: string) => {
    if (!session?.user) return;
    const favKey = `favorites_list_${session.user.id}`;
    const updated = favorites.filter((r) => r.id !== id);
    setFavorites(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));
  };

  const resetForm = () => {
    setEditingRecipeId(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Italian");
    setFormDifficulty("Easy");
    setFormPrep("10 mins");
    setFormCook("15 mins");
    setFormIngredients("");
    setFormInstructions("");
    setUploadedImageUrl("");
    setFormError(null);
    setFormSuccess(false);
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">
          You must be signed in to view your dashboard.
        </p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md border-none cursor-pointer">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const totalLikes = myRecipes.reduce((acc, r) => acc + (r.likes || 0), 0);
  const recipesCount = myRecipes.length;
  const maxFreeRecipes = 2;
  const recipeProgressPercent = Math.min(100, Math.round((recipesCount / maxFreeRecipes) * 100));

  // Compute category breakdown data for Recharts BarChart
  const categoryCounts: Record<string, number> = {};
  myRecipes.forEach((r) => {
    const cat = r.category || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryColors = ["#f97316", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#6366f1"];
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
    <div className="flex-grow flex flex-col lg:flex-row bg-background">
      {/* Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800">
        <span className="font-bold text-sm text-foreground">User Dashboard</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-default-500 hover:text-foreground cursor-pointer"
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
        {/* User Card & Premium Badge */}
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar.Root className="w-10 h-10 rounded-full border-2 border-primary/20 shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary">
              <Avatar.Image src={session.user.image || ""} alt={session.user.name || "User"} />
              <Avatar.Fallback>{session.user.name?.charAt(0).toUpperCase() || "U"}</Avatar.Fallback>
            </Avatar.Root>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[11px] text-default-400 truncate">{session.user.email}</span>
            </div>
          </div>

          {/* Premium vs Standard Badge */}
          {isPremiumUser ? (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>PREMIUM MEMBER</span>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-default-200/60 dark:bg-zinc-800 text-default-600 dark:text-default-400 border border-default-300 dark:border-zinc-700">
              <span>STANDARD ACCOUNT</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {[
            { label: "Overview", icon: LayoutDashboard, tab: "overview" },
            { label: "My Recipes", icon: BookOpen, tab: "my-recipes" },
            { label: "Favorites", icon: Star, tab: "favorites" },
            { label: "Purchased", icon: ShoppingBag, tab: "purchased" },
            { label: "Add Recipe", icon: PlusCircle, tab: "add-recipe" },
          ].map((item) => {
            const isSelected = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Chef Earnings Quick Widget on Sidebar */}
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-default-400 font-medium">Available Payout</span>
            <Chip color="success" variant="soft" size="sm" className="font-extrabold text-[10px]">
              ${availableBalance.toFixed(2)}
            </Chip>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onWithdrawOpen}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Withdraw Money</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Dashboard Area */}
      <main className="flex-grow p-6 sm:p-8 max-w-6xl w-full mx-auto">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8"
          >
            {/* Dynamic Profile Header & Withdraw CTA */}
            <div className="p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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

              {/* Withdraw Earnings & Premium Status CTA Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <Button
                  variant="primary"
                  onClick={onWithdrawOpen}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border-none cursor-pointer hover:scale-105 transition-all"
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

            {/* Standard Account Recipe Limit Progress Alert Banner */}
            {!isPremiumUser && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Standard Account Limit: {recipesCount} of {maxFreeRecipes} Free Recipes Created</span>
                </div>
                <div className="w-full sm:w-48 h-2 bg-amber-500/20 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${recipeProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* 4 Prominent Metric Analytics Cards (Recipes, Sales, Earnings, Payout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Metric Card 1: Total Recipes */}
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-default-400">
                    My Recipes
                  </span>
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-foreground">{myRecipes.length}</span>
                  <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Published creations</span>
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 2: Recipes Sold */}
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-default-400">
                    Recipes Sold
                  </span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-foreground">{totalSalesCount} Sales</span>
                  <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Stripe verified purchases</span>
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 3: Total Gross Earned */}
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-default-400">
                    Gross Earnings
                  </span>
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-foreground">
                    ${totalEarned.toFixed(2)}
                  </span>
                  <p className="text-xs text-default-400 mt-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lifetime recipe revenue</span>
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 4: Available Payout Balance */}
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Available Balance
                  </span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-foreground">
                    ${availableBalance.toFixed(2)}
                  </span>
                  <button
                    onClick={onWithdrawOpen}
                    className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Withdraw Money Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Recharts Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Monthly Engagement & Revenue Trend Chart */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-primary" />
                      <span>Monthly Engagement & Sales Revenue</span>
                    </h3>
                    <span className="text-xs text-default-400">
                      Month-over-month views, likes, and revenue ($)
                    </span>
                  </div>
                  <Chip variant="soft" color="accent" size="sm" className="font-semibold text-[10px]">
                    Live Metrics
                  </Chip>
                </div>

                <div className="h-64 w-full">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SAMPLE_ENGAGEMENT_DATA}>
                        <defs>
                          <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(18, 18, 24, 0.9)",
                            borderColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Sales Revenue ($)"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#revenueGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="likes"
                          name="Likes Received"
                          stroke="#f97316"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#likesGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-default-100 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
                  )}
                </div>
              </div>

              {/* Category Distribution Chart */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-amber-500" />
                      <span>Category Breakdown</span>
                    </h3>
                    <span className="text-xs text-default-400">Recipes across culinary styles</span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} allowDecimals={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(18, 18, 24, 0.9)",
                            borderColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {displayCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-default-100 dark:bg-zinc-800/40 rounded-2xl animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Grid & Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Quick Actions Grid */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-6">
                <div className="flex flex-col">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-orange-500" />
                    <span>Quick Navigation Actions</span>
                  </h3>
                  <span className="text-xs text-default-400">Fast travel shortcuts for chefs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Action 1: Withdraw Earnings */}
                  <button
                    onClick={onWithdrawOpen}
                    className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left group flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                      <ArrowDownToLine className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                      Withdraw Earnings
                    </span>
                    <span className="text-xs text-default-400">Payout to Bank or PayPal</span>
                  </button>

                  {/* Action 2: Create New Recipe */}
                  <button
                    onClick={() => handleTabChange("add-recipe")}
                    className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      Create New Recipe
                    </span>
                    <span className="text-xs text-default-400">Publish a new creation</span>
                  </button>

                  {/* Action 3: View My Collections */}
                  <button
                    onClick={() => handleTabChange("my-recipes")}
                    className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                      View My Collections
                    </span>
                    <span className="text-xs text-default-400">Manage published items</span>
                  </button>

                  {/* Action 4: Browse Catalog */}
                  <Link href="/recipes" className="no-underline">
                    <div className="p-4 rounded-2xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group flex flex-col gap-2 cursor-pointer">
                      <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Compass className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm text-foreground group-hover:text-purple-500 transition-colors">
                        Browse Catalog
                      </span>
                      <span className="text-xs text-default-400">Explore community dishes</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity Feed Timeline */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-emerald-500" />
                      <span>Recent Activity Feed</span>
                    </h3>
                    <span className="text-xs text-default-400">Your latest platform interactions</span>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="flex flex-col gap-4 relative pl-2">
                  <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-default-200 dark:bg-zinc-800" />

                  {activityFeed.map((act) => (
                    <div key={act.id} className="flex items-start gap-4 relative z-10">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${
                          act.type === "sale"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : act.type === "payout"
                            ? "bg-teal-500 text-white border-teal-500"
                            : act.type === "like"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : act.type === "favorite"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
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
                            <span
                              className={`text-xs font-extrabold ${
                                act.type === "payout" ? "text-rose-500" : "text-emerald-500"
                              }`}
                            >
                              {act.amount}
                            </span>
                          )}
                        </div>
                        {act.recipeTitle && (
                          <span className="text-xs text-primary font-semibold">
                            &ldquo;{act.recipeTitle}&rdquo;
                          </span>
                        )}
                        <span className="text-[10px] text-default-400">{act.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. ADD / EDIT RECIPE TAB */}
        {activeTab === "add-recipe" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {editingRecipeId ? "Edit Recipe Details" : "Create New Recipe"}
            </h2>

            {formSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 font-semibold">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Recipe saved successfully! Redirecting...
              </div>
            )}

            {formError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {formError}
              </div>
            )}

            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl"
            >
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-default-500">
                  Recipe Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grandma's Artisan Spaghetti Carbonara"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-default-500">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="Tell us what makes this dish special..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[90px] resize-y"
                  required
                />
              </div>

              {/* Form Grid Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
                  >
                    {["Italian", "Asian", "Mexican", "Desserts", "Seafood", "Salads", "Soups", "Other"].map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Prep Time</label>
                    <input
                      type="text"
                      value={formPrep}
                      onChange={(e) => setFormPrep(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Cook Time</label>
                    <input
                      type="text"
                      value={formCook}
                      onChange={(e) => setFormCook(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Image Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-default-500">Recipe Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="flex items-center gap-2 justify-center px-4 py-3 border border-default-200 dark:border-zinc-800 rounded-xl cursor-pointer bg-default-50 hover:bg-default-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold text-foreground">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4 text-default-400" />
                    )}
                    Upload to ImgBB
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <div className="flex-1 w-full">
                    <input
                      type="url"
                      placeholder="Or paste an image URL..."
                      value={uploadedImageUrl}
                      onChange={(e) => setUploadedImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
                    />
                  </div>
                </div>
                {uploadedImageUrl && (
                  <div className="mt-2 relative h-20 w-32 rounded-xl border overflow-hidden">
                    <img src={uploadedImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Ingredients List */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-default-500">
                  Ingredients (One item per line) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="350g Spaghetti&#10;150g Pancetta&#10;4 Egg yolks"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
                  required
                />
              </div>

              {/* Instructions List */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-default-500">
                  Instructions (One step per line) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="Bring salted water to a boil...&#10;Crisp pancetta in skillet...&#10;Toss pasta with egg mixture..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end border-t border-default-100 dark:border-zinc-800 pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTabChange("my-recipes")}
                  className="border border-default-200 dark:border-zinc-800 px-5 py-2.5 text-xs font-semibold text-foreground rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={isUploading || formSuccess}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 text-xs rounded-xl shadow-md cursor-pointer border-none"
                >
                  {formSuccess ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingRecipeId ? (
                    "Save Changes"
                  ) : (
                    "Publish Recipe"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 3. MY RECIPES TAB */}
        {activeTab === "my-recipes" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">My Shared Recipes</h2>
              <Button
                variant="primary"
                onClick={() => handleTabChange("add-recipe")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 px-4 text-xs rounded-xl shadow-sm flex items-center gap-1.5 border-none cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Recipe</span>
              </Button>
            </div>

            {myRecipes.length > 0 ? (
              <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Recipe</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4 text-center">Likes</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                    {myRecipes.map((recipe) => (
                      <tr
                        key={recipe.id}
                        className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={recipe.image}
                            alt=""
                            className="h-10 w-14 rounded-xl object-cover border border-default-100 dark:border-zinc-800"
                          />
                          <span className="font-bold text-foreground truncate max-w-[180px]">
                            {recipe.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              recipe.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : recipe.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold">{recipe.likes || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Link
                              href={`/recipes/${recipe.id}`}
                              className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground hover:bg-default-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditClick(recipe)}
                              className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                              title="Edit Recipe"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(recipe)}
                              className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer"
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
            ) : (
              <div className="py-20 text-center border border-dashed rounded-3xl flex flex-col items-center gap-4">
                <span className="text-3xl">🍲</span>
                <h3 className="font-bold text-foreground">No Recipes Published</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  You haven&apos;t published any recipes yet. Share your culinary creations with our community!
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("add-recipe")}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Create First Recipe
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 4. FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Favorited Bookmarks</h2>

            {favorites.length > 0 ? (
              <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Recipe</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                    {favorites.map((recipe) => (
                      <tr
                        key={recipe.id}
                        className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={recipe.image}
                            alt=""
                            className="h-10 w-14 rounded-xl object-cover border border-default-100 dark:border-zinc-800"
                          />
                          <span className="font-bold text-foreground truncate max-w-[180px]">
                            {recipe.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4 text-default-400">{recipe.author}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Link
                              href={`/recipes/${recipe.id}`}
                              className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground hover:bg-default-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleUnfavorite(recipe.id)}
                              className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer"
                              title="Unfavorite item"
                            >
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-3xl flex flex-col items-center gap-4">
                <span className="text-3xl">⭐</span>
                <h3 className="font-bold text-foreground">No Favorited Recipes</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  Recipes you bookmark as favorites will show up here. Go explore some dishes!
                </p>
                <Link href="/recipes" className="no-underline">
                  <Button
                    variant="outline"
                    className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Explore Dishes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 5. PURCHASED TAB */}
        {activeTab === "purchased" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Unlocked Premium Content</h2>

            {purchased.length > 0 ? (
              <div className="overflow-x-auto rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Recipe</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Unlocked Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                    {purchased.map((recipe) => (
                      <tr
                        key={recipe.id}
                        className="hover:bg-default-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={recipe.image}
                            alt=""
                            className="h-10 w-14 rounded-xl object-cover border border-default-100 dark:border-zinc-800"
                          />
                          <span className="font-bold text-foreground truncate max-w-[180px]">
                            {recipe.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4 font-bold text-emerald-500">
                          ${recipe.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/recipes/${recipe.id}`}
                            className="no-underline inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default-200 dark:border-zinc-800 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Recipe</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-3xl flex flex-col items-center gap-4">
                <span className="text-3xl">🔑</span>
                <h3 className="font-bold text-foreground">No Purchased Recipes</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  When you buy premium chef recipes through our Stripe integration, they will display here with lifetime access keys.
                </p>
                <Link href="/recipes" className="no-underline">
                  <Button
                    variant="outline"
                    className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Browse Premium Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* WITHDRAW MONEY MODAL COMPONENT */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                onWithdrawClose();
                setWithdrawSuccess(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-default-100 dark:border-zinc-800 shadow-2xl flex flex-col gap-5 z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <ArrowDownToLine className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground">Withdraw Chef Earnings</h3>
                    <span className="text-xs text-default-400">Request payout to your account</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onWithdrawClose();
                    setWithdrawSuccess(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Content */}
              {withdrawSuccess ? (
                /* Success State */
                <div className="py-6 flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Chip color="success" variant="soft" className="mx-auto font-bold uppercase text-[10px]">
                      Payout Submitted
                    </Chip>
                    <h4 className="text-xl font-extrabold text-foreground mt-1">
                      Withdrawal Request Placed
                    </h4>
                    <p className="text-xs text-default-500 max-w-xs leading-relaxed">
                      Your payout request for <strong className="text-foreground">${withdrawAmount}</strong> via {withdrawMethod.toUpperCase()} has been submitted.
                    </p>
                  </div>

                  <div className="w-full p-3.5 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 text-xs flex justify-between items-center">
                    <span className="text-default-400 font-medium">Reference Code</span>
                    <span className="font-mono font-bold text-foreground">{withdrawRef}</span>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      onWithdrawClose();
                      setWithdrawSuccess(false);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl border-none cursor-pointer text-xs"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                /* Payout Request Form */
                <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
                  {/* Balance Display Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Available Balance
                      </span>
                      <span className="text-2xl font-extrabold text-foreground">
                        ${availableBalance.toFixed(2)}
                      </span>
                    </div>
                    <Chip color="success" variant="soft" className="font-bold text-xs uppercase">
                      Ready for Payout
                    </Chip>
                  </div>

                  {/* Payout Method Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">
                      Select Payout Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "stripe", label: "Stripe Direct", icon: CreditCard },
                        { id: "paypal", label: "PayPal", icon: DollarSign },
                        { id: "bank", label: "Bank Wire", icon: Building2 },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWithdrawMethod(m.id)}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            withdrawMethod === m.id
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "border-default-200 dark:border-zinc-800 text-default-600 hover:bg-default-50 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <m.icon className="h-4 w-4" />
                          <span className="text-[11px] font-semibold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Destination Account Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">
                      Payout Destination Email / Account
                    </label>
                    <input
                      type="text"
                      value={payoutAccount}
                      onChange={(e) => setPayoutAccount(e.target.value)}
                      placeholder="e.g. chef@example.com or IBAN"
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-medium outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-default-500">
                        Withdrawal Amount ($ USD)
                      </label>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(availableBalance.toString())}
                        className="text-[11px] font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        Max (${availableBalance.toFixed(2)})
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-default-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-bold outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-default-100 dark:border-zinc-800 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onWithdrawClose}
                      isDisabled={isSubmittingWithdrawal}
                      className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={isSubmittingWithdrawal || availableBalance <= 0}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                    >
                      {isSubmittingWithdrawal ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                          <span>Confirm Withdrawal</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModal.isOpen && recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={deleteModal.onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-rose-500/30 shadow-2xl flex flex-col gap-5 z-10"
            >
              {/* Modal Warning Header */}
              <div className="flex items-center gap-3 border-b border-default-100 dark:border-zinc-800 pb-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                    Confirm Recipe Deletion
                  </h3>
                  <span className="text-xs text-default-400">Destructive action</span>
                </div>
              </div>

              {/* Recipe Snapshot Card */}
              <div className="p-3 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 flex items-center gap-3">
                <img
                  src={recipeToDelete.image}
                  alt={recipeToDelete.title}
                  className="h-12 w-16 rounded-xl object-cover border"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-foreground">{recipeToDelete.title}</span>
                  <span className="text-[10px] text-default-400">{recipeToDelete.category}</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-foreground">&ldquo;{recipeToDelete.title}&rdquo;</strong>? This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={deleteModal.onClose}
                  isDisabled={isDeletingRecipe}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmDelete}
                  isDisabled={isDeletingRecipe}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md shadow-rose-600/20 border-none cursor-pointer"
                >
                  {isDeletingRecipe ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Recipe</span>
                    </>
                  )}
                </Button>
              </div>
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
