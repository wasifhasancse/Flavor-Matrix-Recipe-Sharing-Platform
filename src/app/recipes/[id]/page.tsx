"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import { mockRecipes } from "@/data/recipes";
import { Link, Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Star,
  Flag,
  Lock,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Clock,
  ChefHat,
  ChevronRight,
  AlertCircle,
  X
} from "lucide-react";

interface RecipeDetailsPageProps {
  params: Promise<{ id: string }>;
}

function RecipeDetailsContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment_success") === "true";
  const paymentCancelled = searchParams.get("payment_cancelled") === "true";

  const recipe = mockRecipes.find((r) => r.id === id);

  // States
  const [likesCount, setLikesCount] = useState(recipe?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Report Modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load purchase state from LocalStorage for persistence simulation
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

  if (!recipe) {
    return (
      <div className="flex-grow max-w-xl mx-auto w-full px-4 py-20 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-16 w-16 text-danger" />
        <h1 className="text-2xl font-bold text-foreground">Recipe Not Found</h1>
        <p className="text-default-500">
          The recipe you are looking for does not exist or has been removed.
        </p>
        <Link href="/recipes" className="no-underline">
          <Button variant="primary" className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  const isPremium = (recipe.price || 0) > 0;
  const showContent = !isPremium || isPurchased;

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
    } else {
      setLikesCount((prev) => prev + 1);
    }
    setHasLiked(!hasLiked);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: recipe.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to trigger payment checkout.");
        setIsPurchasing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to checkout backend. Please try again.");
      setIsPurchasing(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    setIsReporting(true);
    
    // Simulate API call to report
    setTimeout(() => {
      setIsReporting(false);
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSuccess(false);
        setReportReason("");
      }, 2000);
    }, 1200);
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background relative">
      {/* Back navigation */}
      <div className="flex items-center">
        <Link href="/recipes" className="text-default-500 hover:text-foreground text-sm font-semibold flex items-center gap-1.5 no-underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Link>
      </div>

      {/* Payment Notifications */}
      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 font-medium">
          <CheckCircle className="h-5 w-5" />
          Payment successful! You now have permanent access to &ldquo;{recipe.title}&rdquo;.
        </div>
      )}
      {paymentCancelled && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm flex items-center gap-2 font-medium">
          <AlertCircle className="h-5 w-5" />
          Checkout was cancelled. Premium recipes require payment to unlock full contents.
        </div>
      )}

      {/* Main recipe header banner */}
      <div className="flex flex-col lg:flex-row gap-8 items-start border-b border-default-100 dark:border-zinc-800 pb-10">
        {/* Aspect Image */}
        <div className="w-full lg:w-[480px] aspect-video lg:aspect-square rounded-2xl overflow-hidden border border-default-100 dark:border-zinc-800 shadow-md shrink-0 bg-default-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header content details */}
        <div className="flex-grow flex flex-col gap-5 justify-center h-full self-stretch">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {recipe.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
              recipe.difficulty === "Easy"
                ? "bg-success/10 text-success"
                : recipe.difficulty === "Medium"
                ? "bg-warning/10 text-warning"
                : "bg-danger/10 text-danger"
            }`}>
              {recipe.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {recipe.title}
          </h1>

          <p className="text-default-500 text-sm leading-relaxed max-w-2xl">
            {recipe.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-default-600 border-t border-b border-default-100 dark:border-zinc-800/80 py-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-default-400" />
              <span>Prep: <strong>{recipe.prepTime}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-default-400" />
              <span>Cook: <strong>{recipe.cookTime}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="h-4.5 w-4.5 text-default-400" />
              <span>By: <strong>{recipe.author}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout details content */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left Column: Ingredients / Directions (Blurred if premium & not purchased) */}
        <div className="flex-grow w-full flex flex-col gap-8">
          {showContent ? (
            <>
              {/* Ingredients */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Ingredients
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                  {recipe.ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-default-700 dark:text-default-300"
                    >
                      <input
                        type="checkbox"
                        id={`ing-${idx}`}
                        className="mt-1 h-4 w-4 rounded border-default-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                      />
                      <label htmlFor={`ing-${idx}`} className="cursor-pointer">
                        {ing}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-4 border-t border-default-100 dark:border-zinc-800/60 pt-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Instructions
                </h2>
                <div className="flex flex-col gap-6">
                  {recipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-default-700 dark:text-default-300 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Premium blurred overlay preview block */
            <div className="relative rounded-2xl border border-default-100 dark:border-zinc-800 overflow-hidden bg-default-50/50 dark:bg-zinc-900/30 p-8 py-16 flex flex-col items-center text-center gap-6 shadow-sm">
              <div className="h-14 w-14 rounded-full bg-warning/10 text-warning border border-warning/20 flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-2 max-w-md">
                <h2 className="text-xl font-bold text-foreground">Premium Recipe Protected</h2>
                <p className="text-sm text-default-500 leading-relaxed">
                  &ldquo;{recipe.title}&rdquo; is a premium recipe crafted by {recipe.author}. Unlock access to full ingredients checklist and step-by-step cooking directions!
                </p>
              </div>
              <Button
                onPress={handlePurchase}
                variant="primary"
                className="bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
                isDisabled={isPurchasing}
              >
                {isPurchasing ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Lock className="h-4.5 w-4.5" />
                )}
                Unlock for ${recipe.price?.toFixed(2)}
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Actions widgets bar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-md flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-default-500">
              Recipe Actions
            </h3>
            
            {/* Purchase CTA Widget */}
            {isPremium && (
              <div className="flex flex-col gap-2.5 pb-2 border-b border-default-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Recipe Type</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-warning/15 text-warning-600 border border-warning/25">Premium</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Price</span>
                  <span className="font-extrabold text-foreground text-lg">${recipe.price?.toFixed(2)}</span>
                </div>
                {isPurchased ? (
                  <div className="w-full py-2.5 rounded-lg bg-success/10 border border-success/20 text-success font-semibold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Purchased & Unlocked
                  </div>
                ) : (
                  <Button
                    onPress={handlePurchase}
                    variant="primary"
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-md transition-all"
                    isDisabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <span>Buy Recipe</span>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Like & Favorite Buttons */}
            <div className="flex gap-3">
              <Button
                onPress={handleLike}
                variant="outline"
                className={`flex-1 py-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  hasLiked
                    ? "bg-danger/10 border-danger/20 text-danger hover:bg-danger/20"
                    : "border-default-200 dark:border-zinc-700 text-default-600 hover:bg-default-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${hasLiked ? "fill-danger text-danger" : ""}`} />
                <span>{likesCount} Likes</span>
              </Button>

              <Button
                onPress={handleFavorite}
                variant="outline"
                className={`flex-1 py-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  isFavorited
                    ? "bg-warning/10 border-warning/20 text-warning-600 hover:bg-warning/20"
                    : "border-default-200 dark:border-zinc-700 text-default-600 hover:bg-default-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Star className={`h-4.5 w-4.5 ${isFavorited ? "fill-warning text-warning-600" : ""}`} />
                <span>Favorite</span>
              </Button>
            </div>

            {/* Report CTA */}
            <Button
              onPress={() => setIsReportOpen(true)}
              variant="outline"
              className="w-full py-2.5 rounded-lg border border-default-200 dark:border-zinc-700 text-default-600 hover:bg-danger/5 hover:text-danger hover:border-danger/30 font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Flag className="h-4 w-4" />
              Report Recipe
            </Button>
          </div>
        </aside>
      </div>

      {/* 4. Report Recipe Modal Box */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsReportOpen(false)} />
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-default-100 dark:border-zinc-800 shadow-2xl flex flex-col gap-5 z-10 animate-in fade-in zoom-in duration-200">
            
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800/80 pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Flag className="h-4.5 w-4.5 text-danger" />
                Report Recipe
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {reportSuccess ? (
              /* Success confirmation state */
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle className="h-12 w-12 text-success" />
                <h4 className="font-bold text-foreground">Report Received</h4>
                <p className="text-xs text-default-500 max-w-xs">
                  Thank you for keeping our platform safe. Our administrators will review &ldquo;{recipe.title}&rdquo; shortly.
                </p>
              </div>
            ) : (
              /* Reason selection Form */
              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                <p className="text-xs text-default-500 leading-relaxed">
                  Please select the reason for reporting this recipe. We take copyright issues and offensive content seriously.
                </p>
                
                {/* Radio list options */}
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Spam", value: "spam", desc: "Unrelated content, promotional plugs, or advertisement bots." },
                    { label: "Offensive", value: "offensive", desc: "Hate speech, profanity, inappropriate media, or harassment." },
                    { label: "Copyright infringement", value: "copyright", desc: "Plagiarized recipes or stolen media content without consent." }
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-default-50 dark:hover:bg-zinc-900/50 ${
                        reportReason === opt.value
                          ? "bg-primary/5 border-primary"
                          : "border-default-150 dark:border-zinc-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={opt.value}
                        checked={reportReason === opt.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="mt-1 h-4.5 w-4.5 text-primary border-default-300 focus:ring-primary"
                        required
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                        <span className="text-[11px] text-default-400">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-default-100 dark:border-zinc-800/80">
                  <Button
                    type="button"
                    variant="outline"
                    onPress={() => setIsReportOpen(false)}
                    className="border border-default-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-default-700 dark:text-default-300 rounded-lg hover:bg-default-50 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-danger text-white font-semibold px-5 py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                    isDisabled={isReporting || !reportReason}
                  >
                    {isReporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecipeDetailsPage(props: RecipeDetailsPageProps) {
  // Unwrap dynamic params with use() hook in React 19 Client Component
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
