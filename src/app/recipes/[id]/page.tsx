"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Modal,
  Chip,
  Avatar,
} from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Star,
  Flag,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Clock,
  ChefHat,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
  ShieldAlert,
  ShoppingBag,
  Award,
  Users,
  AlertCircle,
  X,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

interface RecipeDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Custom Disclosure Hook for Modal state control
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);
  return { isOpen, onOpen, onClose, onToggle, onOpenChange: setIsOpen };
}

function RecipeDetailsContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment_success") === "true";
  const paymentCancelled = searchParams.get("payment_cancelled") === "true";

  // Modal Disclosure Hook for Report Modal
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure(false);

  // Recipe State & Data Fetching
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Core Interactive Feature States
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);

  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState<boolean>(false);

  // Bookmark State
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState<boolean>(false);

  // Rating State
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(4.8);
  const [totalRatings, setTotalRatings] = useState<number>(42);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState<boolean>(false);

  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  // Author Follow state
  const [isFollowingAuthor, setIsFollowingAuthor] = useState<boolean>(false);

  // Serving scale factor
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);

  // Checked maps for Ingredients and Instructions
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Copy Feedback
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Report Form States
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Initial Data Fetching
  useEffect(() => {
    let isMounted = true;
    async function loadRecipe() {
      setIsLoadingRecipe(true);
      setFetchError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/recipes/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.recipe) {
            setRecipe(data.recipe);
            setLikesCount(data.recipe.likes || 0);
            setIsLoadingRecipe(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch failed, utilizing fallback dataset:", err);
      }

      // Fallback to local dataset if API fetch is unavailable
      const localRecipe = mockRecipes.find((r) => r.id === id);
      if (isMounted) {
        if (localRecipe) {
          setRecipe(localRecipe);
          setLikesCount(localRecipe.likes || 0);
        } else {
          setFetchError("Recipe not found.");
        }
        setIsLoadingRecipe(false);
      }
    }

    loadRecipe();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load local purchase persistence
  useEffect(() => {
    if (!recipe) return;

    const localKey = `purchased_${recipe.id}`;
    if (paymentSuccess) {
      localStorage.setItem(localKey, "true");
      setIsPurchased(true);
    } else {
      const stored = localStorage.getItem(localKey);
      if (stored === "true") {
        setIsPurchased(true);
      }
    }
  }, [id, recipe, paymentSuccess]);

  // Handle Dynamic Like Action (PATCH)
  const handleLike = async () => {
    if (!recipe || isLikeLoading) return;

    const nextHasLiked = !hasLiked;
    const nextCount = nextHasLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    // Optimistic UI Update
    setHasLiked(nextHasLiked);
    setLikesCount(nextCount);
    setIsLikeLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/recipes/${recipe.id}/like`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextHasLiked ? "like" : "unlike" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === "number") {
          setLikesCount(data.likes);
        }
      }
    } catch (err) {
      console.error("Failed to update like status:", err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle Favorite Action (POST)
  const handleFavorite = async () => {
    if (!recipe || isFavoriteLoading) return;

    const nextFavorited = !isFavorited;

    // Optimistic UI Update
    setIsFavorited(nextFavorited);
    setIsFavoriteLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      await fetch(`${baseUrl}/api/recipes/${recipe.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorited: nextFavorited }),
      });
    } catch (err) {
      console.error("Failed to update favorite status:", err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Handle Bookmark Action (POST/DELETE)
  const handleBookmark = async () => {
    if (!recipe || isBookmarkLoading) return;

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setIsBookmarkLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      if (nextBookmarked) {
        await fetch(`${baseUrl}/api/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: recipe.id }),
        });
      } else {
        await fetch(`${baseUrl}/api/bookmarks/${recipe.id}`, {
          method: "DELETE",
        });
      }
    } catch (err) {
      console.error("Failed to update bookmark status:", err);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  // Handle Rating Submission (POST)
  const handleRateSubmit = async (score: number) => {
    if (!recipe || isRatingSubmitting) return;

    setUserRating(score);
    setIsRatingSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/recipes/${recipe.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.averageRating) {
          setAvgRating(data.data.averageRating);
        }
        if (data.data?.totalRatings) {
          setTotalRatings(data.data.totalRatings);
        }
      }
    } catch (err) {
      console.error("Failed to submit recipe rating:", err);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Handle Purchase Navigation to Payment Checkout
  const handlePurchase = () => {
    if (!recipe) return;
    window.location.href = `/checkout/${recipe.id}`;
  };

  // Handle Report Form Submission (POST)
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe || !reportReason || isSubmittingReport) return;

    setIsSubmittingReport(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setReportReason("spam");
          setReportDetails("");
          onReportClose();
        }, 1800);
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (err) {
      console.error("Report submit error:", err);
      alert("Network error submitting report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Toggle Ingredient Item
  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Toggle Instruction Step
  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Copy Ingredients to Clipboard
  const handleCopyIngredients = () => {
    if (!recipe) return;
    const text = recipe.ingredients.map((ing) => `- ${ing}`).join("\n");
    navigator.clipboard.writeText(`Ingredients for ${recipe.title}:\n\n${text}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Loading Screen Skeleton
  if (isLoadingRecipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 w-full">
        <div className="h-6 w-32 bg-default-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[480px] aspect-video lg:aspect-square bg-default-200 dark:bg-zinc-800 rounded-3xl animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="h-8 w-3/4 bg-default-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-default-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-24 w-full bg-default-200 dark:bg-zinc-800 rounded-2xl animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // Error State Screen
  if (fetchError || !recipe) {
    return (
      <div className="flex-grow max-w-xl mx-auto w-full px-4 py-20 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-16 w-16 text-danger" />
        <h1 className="text-2xl font-bold text-foreground">Recipe Not Found</h1>
        <p className="text-default-500">
          The requested recipe could not be loaded or may have been removed.
        </p>
        <Link href="/recipes" className="no-underline">
          <Button
            variant="primary"
            className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer border-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Recipes
          </Button>
        </Link>
      </div>
    );
  }

  const isPremium = (recipe.price || 0) > 0;
  const showContent = !isPremium || isPurchased;

  // Calculation helpers
  const totalIngredientsCount = recipe.ingredients.length;
  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;

  const totalStepsCount = recipe.instructions.length;
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / totalStepsCount) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background relative"
    >
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/recipes"
          className="text-default-500 hover:text-primary transition-colors text-sm font-semibold flex items-center gap-1.5 no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Recipes</span>
        </Link>

        {/* Category Chip */}
        <Chip variant="soft" color="accent" className="font-bold uppercase tracking-wider text-[11px]">
          {recipe.category}
        </Chip>
      </div>

      {/* Payment Banner Alerts */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3 font-medium shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              Payment successful! You now have permanent unlocked access to &ldquo;{recipe.title}&rdquo;.
            </span>
          </motion.div>
        )}
        {paymentCancelled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-3 font-medium shadow-sm"
          >
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <span>
              Checkout process was cancelled. Unlock this premium recipe to access full ingredients and step-by-step instructions.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Recipe Header Card */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch border-b border-default-100 dark:border-zinc-800 pb-10">
        {/* Cover Image Container */}
        <div className="relative w-full lg:w-[480px] aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-default-100 dark:border-zinc-800 shadow-xl shrink-0 group bg-default-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
              {recipe.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md border border-white/20 ${
                recipe.difficulty === "Easy"
                  ? "bg-emerald-500/80 text-white"
                  : recipe.difficulty === "Medium"
                  ? "bg-amber-500/80 text-white"
                  : "bg-rose-500/80 text-white"
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>

          {isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-black shadow-lg flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                ${recipe.price?.toFixed(2)} Premium
              </span>
            </div>
          )}
        </div>

        {/* Content & Metadata Details */}
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Gourmet Recipe Collection</span>
            </div>

            <DynamicBreadcrumb />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {recipe.title}
            </h1>

            <p className="text-default-500 text-base leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Chips & Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-default-100 dark:border-zinc-800">
            <div className="flex flex-col p-3 rounded-2xl bg-default-50 dark:bg-zinc-900/60 border border-default-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-default-400 font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Prep Time</span>
              </div>
              <span className="text-sm font-bold text-foreground mt-1">
                {recipe.prepTime}
              </span>
            </div>

            <div className="flex flex-col p-3 rounded-2xl bg-default-50 dark:bg-zinc-900/60 border border-default-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-default-400 font-medium">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span>Cook Time</span>
              </div>
              <span className="text-sm font-bold text-foreground mt-1">
                {recipe.cookTime}
              </span>
            </div>

            <div className="flex flex-col p-3 rounded-2xl bg-default-50 dark:bg-zinc-900/60 border border-default-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-default-400 font-medium">
                <ChefHat className="h-3.5 w-3.5 text-amber-500" />
                <span>Difficulty</span>
              </div>
              <span className="text-sm font-bold text-foreground mt-1">
                {recipe.difficulty}
              </span>
            </div>

            <div className="flex flex-col p-3 rounded-2xl bg-default-50 dark:bg-zinc-900/60 border border-default-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-default-400 font-medium">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span>Community Likes</span>
              </div>
              <span className="text-sm font-bold text-foreground mt-1">
                {likesCount} Likes
              </span>
            </div>
          </div>

          {/* Author Profile Snippet */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-default-100 dark:border-zinc-800 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar.Root className="w-12 h-12 rounded-full border-2 border-primary/20 shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary">
                <Avatar.Image
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80"
                  alt={recipe.author}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback>{recipe.author.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground text-sm sm:text-base">
                    {recipe.author}
                  </span>
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-default-400">
                  Executive Chef & Recipe Creator
                </span>
              </div>
            </div>

            <Button
              variant={isFollowingAuthor ? "outline" : "primary"}
              onClick={() => setIsFollowingAuthor(!isFollowingAuthor)}
              className="font-bold rounded-xl text-xs px-4 py-2 flex items-center gap-1.5 border-none cursor-pointer"
            >
              {isFollowingAuthor ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span>Follow Chef</span>
                </>
              )}
            </Button>
          </div>

          {/* Interactive Multi-Star Rating Component & Score Breakdown */}
          <div className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row gap-6 items-center justify-between mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {avgRating.toFixed(1)}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-default-300 dark:text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-default-400 font-semibold mt-0.5">
                    Based on {totalRatings} community ratings
                  </span>
                </div>
              </div>
              <span className="text-xs text-default-500">
                Rate & share your cooking experience with home chefs worldwide!
              </span>
            </div>

            {/* Interactive Multi-Star Input Component */}
            <div className="flex flex-col items-center sm:items-end gap-2 bg-default-50/70 dark:bg-zinc-950/80 p-4 rounded-2xl border border-default-100 dark:border-zinc-800/80 shrink-0">
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                {userRating > 0 ? "Your Rating" : "Tap Stars to Rate"}
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => {
                  const isActive = (hoverRating || userRating) >= score;
                  return (
                    <button
                      key={score}
                      type="button"
                      onMouseEnter={() => setHoverRating(score)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRateSubmit(score)}
                      className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isActive
                            ? "fill-amber-400 text-amber-400"
                            : "text-default-300 dark:text-zinc-700 hover:text-amber-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {userRating > 0 && (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Score {userRating} submitted!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Ingredients & Instructions */}
        <div className="flex-1 w-full flex flex-col gap-10">
          {showContent ? (
            <>
              {/* Ingredients Section */}
              <section className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-default-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-primary" />
                      Ingredients Needed
                    </h2>
                    <p className="text-xs text-default-400 mt-1">
                      {checkedIngredientsCount} of {totalIngredientsCount} items checked off
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Servings Multiplier */}
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-default-200 dark:border-zinc-800 bg-default-50 dark:bg-zinc-900 text-xs">
                      <span className="text-default-400 font-medium mr-1">Servings:</span>
                      <button
                        onClick={() => setServingsMultiplier(Math.max(1, servingsMultiplier - 1))}
                        disabled={servingsMultiplier <= 1}
                        className="p-1 rounded hover:bg-default-200 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold text-foreground px-1">{servingsMultiplier}x</span>
                      <button
                        onClick={() => setServingsMultiplier(Math.min(4, servingsMultiplier + 1))}
                        disabled={servingsMultiplier >= 4}
                        className="p-1 rounded hover:bg-default-200 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Copy Ingredients Button */}
                    <Button
                      variant="outline"
                      onClick={handleCopyIngredients}
                      className="text-xs font-semibold rounded-xl px-3 py-1.5 border border-default-200 dark:border-zinc-800 cursor-pointer"
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <Check className="h-3.5 w-3.5" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-3.5 w-3.5" /> Copy List
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Interactive Ingredients List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ing, idx) => {
                    const isChecked = Boolean(checkedIngredients[idx]);
                    return (
                      <motion.div
                        key={idx}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleIngredient(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? "bg-primary/5 border-primary/30 text-default-400 dark:text-default-500"
                            : "bg-white/60 dark:bg-zinc-900/60 border-default-100 dark:border-zinc-800 hover:border-default-300 dark:hover:border-zinc-700 text-foreground"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? "bg-primary border-primary text-white"
                              : "border-default-300 dark:border-zinc-700 bg-background"
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-sm font-medium leading-relaxed ${
                            isChecked ? "line-through" : ""
                          }`}
                        >
                          {ing}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Instructions Section */}
              <section className="flex flex-col gap-6 pt-6 border-t border-default-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-default-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-orange-500" />
                      Step-by-Step Instructions
                    </h2>
                    <p className="text-xs text-default-400 mt-1">
                      {completedStepsCount} of {totalStepsCount} steps completed ({progressPercent}%)
                    </p>
                  </div>

                  {/* Cooking Progress Bar */}
                  <div className="w-full sm:w-48 flex flex-col gap-1.5">
                    <div className="h-2 w-full bg-default-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Steps Cards */}
                <div className="flex flex-col gap-4">
                  {recipe.instructions.map((step, idx) => {
                    const isDone = Boolean(completedSteps[idx]);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 ${
                          isDone
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/60 dark:bg-zinc-900/60 border-default-100 dark:border-zinc-800"
                        }`}
                      >
                        {/* Step Badge & Mark Button */}
                        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0">
                          <span
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-extrabold text-sm border transition-colors ${
                              isDone
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                          </span>

                          <Button
                            variant={isDone ? "outline" : "secondary"}
                            onClick={() => toggleStep(idx)}
                            className="text-[11px] font-semibold h-7 rounded-lg border-none cursor-pointer"
                          >
                            {isDone ? "Completed" : "Mark Done"}
                          </Button>
                        </div>

                        {/* Step Text */}
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-default-400">
                            Step {idx + 1}
                          </span>
                          <p
                            className={`text-sm sm:text-base leading-relaxed ${
                              isDone ? "text-default-400 line-through" : "text-foreground"
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            /* Premium Recipe Protected Card Overlay */
            <div className="relative rounded-3xl border border-amber-500/30 overflow-hidden bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 p-8 py-16 flex flex-col items-center text-center gap-6 shadow-xl">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8" />
              </div>

              <div className="flex flex-col gap-3 max-w-md">
                <Chip color="warning" variant="soft" className="mx-auto font-bold uppercase text-xs">
                  Premium Recipe Content Protected
                </Chip>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Unlock Complete Recipe Access
                </h2>
                <p className="text-sm text-default-500 leading-relaxed">
                  &ldquo;{recipe.title}&rdquo; is an exclusive creation by {recipe.author}. Unlock to access ingredients list, serving scaler, and step-by-step masterclass instructions!
                </p>
              </div>

              <Link href={`/checkout/${recipe.id}`} className="no-underline">
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold px-10 py-4 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center gap-2.5 text-base border-none hover:scale-105 transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Unlock Now for ${recipe.price?.toFixed(2)}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: Core Action Widgets */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24">
          <div className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl flex flex-col gap-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-default-400">
              Recipe Actions
            </h3>

            {/* Premium Purchase Box */}
            {isPremium && (
              <div className="flex flex-col gap-3 pb-4 border-b border-default-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-400 font-medium">Access Tier</span>
                  <Chip color="warning" variant="soft" className="font-bold uppercase text-[10px]">
                    Premium Recipe
                  </Chip>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-400 font-medium">One-Time Price</span>
                  <span className="font-extrabold text-foreground text-xl">
                    ${recipe.price?.toFixed(2)}
                  </span>
                </div>

                {isPurchased ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Lifetime Unlocked</span>
                  </div>
                ) : (
                  <Link href={`/checkout/${recipe.id}`} className="no-underline w-full">
                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 border-none cursor-pointer"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      <span>Buy Recipe Access</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Like & Favorite Interactive Buttons */}
            <div className="flex gap-3">
              {/* Like Button */}
              <Button
                variant="outline"
                onClick={handleLike}
                isDisabled={isLikeLoading}
                className={`flex-1 font-semibold rounded-xl flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  hasLiked
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                    : "border-default-200 dark:border-zinc-800 text-foreground"
                }`}
              >
                {isLikeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                ) : (
                  <Heart className={`h-4.5 w-4.5 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                )}
                <span>{likesCount}</span>
              </Button>

              {/* Favorite Button */}
              <Button
                variant="outline"
                onClick={handleFavorite}
                isDisabled={isFavoriteLoading}
                className={`flex-1 font-semibold rounded-xl flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isFavorited
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "border-default-200 dark:border-zinc-800 text-foreground"
                }`}
              >
                {isFavoriteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                ) : (
                  <Star
                    className={`h-4.5 w-4.5 ${
                      isFavorited ? "fill-amber-500 text-amber-500" : ""
                    }`}
                  />
                )}
                <span>{isFavorited ? "Saved" : "Save"}</span>
              </Button>
            </div>

            {/* Bookmark Action Button */}
            <Button
              variant="outline"
              onClick={handleBookmark}
              isDisabled={isBookmarkLoading}
              className={`w-full font-semibold rounded-xl flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isBookmarked
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-default-200 dark:border-zinc-800 text-foreground"
              }`}
            >
              {isBookmarkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : isBookmarked ? (
                <BookmarkCheck className="h-4.5 w-4.5 text-primary" />
              ) : (
                <Bookmark className="h-4.5 w-4.5" />
              )}
              <span>{isBookmarked ? "Bookmarked" : "Bookmark Recipe"}</span>
            </Button>

            {/* Report Recipe Button (Triggers HeroUI Modal) */}
            <Button
              variant="outline"
              onClick={onReportOpen}
              className="w-full font-semibold rounded-xl border border-default-200 dark:border-zinc-800 hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-500 transition-all flex items-center justify-center gap-2 text-default-600 cursor-pointer"
            >
              <Flag className="h-4 w-4" />
              <span>Report Recipe</span>
            </Button>
          </div>
        </aside>
      </div>

      {/* HeroUI Report Modal Component */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onReportClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-default-100 dark:border-zinc-800 shadow-2xl flex flex-col gap-4 z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800/80 pb-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Flag className="h-5 w-5 text-rose-500" />
                  <span>Report Recipe</span>
                </h3>
                <button
                  onClick={onReportClose}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-2 flex flex-col gap-4">
                {reportSuccess ? (
                  <div className="py-8 flex flex-col items-center gap-3 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <h4 className="font-bold text-foreground text-lg">Report Submitted</h4>
                    <p className="text-xs text-default-500 max-w-xs leading-relaxed">
                      Thank you for helping us maintain platform safety. Our team will review &ldquo;{recipe.title}&rdquo; promptly.
                    </p>
                  </div>
                ) : (
                  <form id="report-form" onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                    <p className="text-xs text-default-500 leading-relaxed">
                      Please select the reason for reporting this recipe. We review all community reports carefully.
                    </p>

                    {/* Radio Options */}
                    <div className="flex flex-col gap-2.5">
                      {[
                        {
                          id: "spam",
                          label: "Spam or Misleading",
                          desc: "Unrelated content, promotional plugs, or automated spam posts.",
                        },
                        {
                          id: "offensive",
                          label: "Offensive Content",
                          desc: "Hate speech, profanity, inappropriate media, or harassment.",
                        },
                        {
                          id: "copyright",
                          label: "Copyright Infringement",
                          desc: "Stolen text, plagiarized recipe steps, or uncredited images.",
                        },
                        {
                          id: "other",
                          label: "Other Issue",
                          desc: "Inaccurate instructions, dangerous ingredients, or formatting bugs.",
                        },
                      ].map((option) => (
                        <label
                          key={option.id}
                          className={`flex gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            reportReason === option.id
                              ? "bg-primary/5 border-primary/50 text-foreground"
                              : "border-default-150 dark:border-zinc-800 hover:bg-default-50 dark:hover:bg-zinc-900/50 text-default-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="reportReason"
                            value={option.id}
                            checked={reportReason === option.id}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="mt-0.5 h-4 w-4 text-primary border-default-300 focus:ring-primary cursor-pointer shrink-0"
                            required
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold">{option.label}</span>
                            <span className="text-xs text-default-400">{option.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Details Text Area */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-xs font-semibold text-default-500">
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Provide any additional context for moderators..."
                        rows={3}
                        className="w-full p-3 rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-xs outline-none focus:border-primary text-foreground resize-none"
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              {!reportSuccess && (
                <div className="flex gap-2 justify-end pt-3 border-t border-default-100 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={onReportClose}
                    isDisabled={isSubmittingReport}
                    className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="report-form"
                    variant="danger"
                    isDisabled={isSubmittingReport || !reportReason}
                    className="font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md bg-rose-500 text-white border-none cursor-pointer"
                  >
                    {isSubmittingReport ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Flag className="h-3.5 w-3.5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RecipeDetailsPage(props: RecipeDetailsPageProps) {
  // React 19 dynamic route parameter unwrapping with use()
  const { id } = use(props.params);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading recipe details...</p>
        </div>
      }
    >
      <RecipeDetailsContent id={id} />
    </Suspense>
  );
}
