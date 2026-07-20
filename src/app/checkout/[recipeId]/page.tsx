"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { motion } from "motion/react";
import {
  Lock,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Clock,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
interface CheckoutPageProps {
  params: Promise<{ recipeId: string }>;
}

export default function CheckoutSummaryPage(props: CheckoutPageProps) {
  const { recipeId } = use(props.params);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!session) {
      e.preventDefault();
      router.push(`/login?callbackURL=/checkout/${recipeId}`);
    }
  };

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Promo code states
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Load Recipe Data
  useEffect(() => {
    let isMounted = true;
    async function fetchRecipe() {
      setIsLoadingRecipe(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        const res = await fetch(`${baseUrl}/api/recipes/${recipeId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.recipe) {
            setRecipe(data.recipe);
            setIsLoadingRecipe(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed fetching recipe API, using fallback data:", err);
      }

      const local = mockRecipes.find((r) => r.id === recipeId);
      if (isMounted) {
        setRecipe(local || null);
        setIsLoadingRecipe(false);
      }
    }

    fetchRecipe();
    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  // Promo Code Apply
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !recipe) return;

    if (promoCode.trim().toUpperCase() === "FLAVOR10" || promoCode.trim().toUpperCase() === "CHEF10") {
      const discount = (recipe.price || 0) * 0.1;
      setDiscountAmount(discount);
      setPromoMessage("10% Discount applied!");
    } else {
      setPromoMessage("Invalid promo code. Try 'FLAVOR10'");
    }
  };

  // Loading Skeleton Screen
  if (isLoadingRecipe) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8 w-full">
        <div className="h-6 w-36 bg-default-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 h-96 bg-default-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
          <div className="lg:col-span-5 h-96 bg-default-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Recipe Not Found or Free Recipe Screen
  if (!recipe) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-20 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-16 w-16 text-danger" />
        <h1 className="text-2xl font-bold text-foreground">Recipe Not Found</h1>
        <p className="text-default-500 text-sm">
          The specified recipe for checkout could not be located.
        </p>
        <Link href="/recipes" className="no-underline">
          <Button  className="btn-primary  text-white font-bold rounded-xl px-6 py-3 border-none cursor-pointer">
            Return to Browse
          </Button>
        </Link>
      </div>
    );
  }

  const basePrice = recipe.price || 0;
  const serviceFee = 0.0;
  const tax = 0.0;
  const finalPrice = Math.max(0, basePrice - discountAmount + serviceFee + tax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background relative"
    >
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-default-100 dark:border-zinc-800 pb-4">
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-default-500 hover:text-primary transition-colors text-sm font-semibold flex items-center gap-1.5 no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Recipe Details</span>
        </Link>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold text-default-400">
            Secure 256-Bit SSL Checkout
          </span>
        </div>
      </div>

      {/* Main Split-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Checkout Order Summary</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Review Your Recipe Purchase
            </h1>
          </div>

          {/* Product Overview Card */}
          <div className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-full sm:w-44 aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-default-100 dark:border-zinc-800 shrink-0 bg-default-100">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                {recipe.category}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between">
                <Chip color="warning" variant="soft" className="font-bold text-[10px] uppercase">
                  Premium Tier
                </Chip>
                <span className="text-xs text-default-400 font-medium">
                  By {recipe.author}
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground leading-snug">
                {recipe.title}
              </h2>

              <p className="text-xs text-default-500 line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-default-400 border-t border-default-100 dark:border-zinc-800 pt-3 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{recipe.prepTime} Prep</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5 text-amber-500" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included Feature List */}
          <div className="p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-default-50/50 dark:bg-zinc-900/40 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              <span>What You Get With This Unlock:</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-default-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Full Ingredients & Scaling Tool</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Step-by-Step Cooking Masterclass</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Printable High-Res Recipe Card</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Lifetime Access Guarantee</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Payment Details & Order Billing */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl flex flex-col gap-6">
            <h3 className="font-bold text-lg text-foreground flex items-center justify-between border-b border-default-100 dark:border-zinc-800 pb-4">
              <span>Payment Summary</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </h3>

            {/* Price Breakdown Table */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-default-500">
                <span>Recipe Item Price</span>
                <span className="font-semibold text-foreground">${basePrice.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-medium">
                  <span>Promo Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-default-500">
                <span>Service & Processing</span>
                <span className="font-semibold text-emerald-500">FREE</span>
              </div>

              <div className="flex justify-between items-center text-default-500">
                <span>Estimated Tax</span>
                <span className="font-semibold text-foreground">$0.00</span>
              </div>

              <div className="border-t border-default-100 dark:border-zinc-800 my-2 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-foreground">Total Due Today</span>
                <span className="text-2xl font-extrabold text-foreground">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-default-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo Code (e.g. FLAVOR10)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-default-200 dark:border-zinc-800 bg-default-50 dark:bg-zinc-900 text-foreground outline-none focus:border-primary uppercase font-bold"
                  />
                </div>
                <Button
                  type="submit"

                  className="btn-secondary font-bold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
              {promoMessage && (
                <span
                  className={`text-[11px] font-medium ${
                    discountAmount > 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {promoMessage}
                </span>
              )}
            </form>

            {/* Primary Confirm Payment - HTML Form for direct Stripe redirect */}
            <form action="/api/checkout-session" method="POST" onSubmit={handleCheckoutSubmit}>
              {/* Hidden metadata bindings */}
              <input type="hidden" name="recipeId" value={recipe.id} />
              <input type="hidden" name="price" value={finalPrice.toFixed(2)} />
              <input type="hidden" name="recipeName" value={recipe.title} />
              <input type="hidden" name="recipeAuthor" value={recipe.author} />
              <input type="hidden" name="recipeImage" value={recipe.image} />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2.5 text-base border-none cursor-pointer hover:scale-[1.02] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Confirm &amp; Pay ${finalPrice.toFixed(2)} via Stripe</span>
              </button>
            </form>

            {/* Security Guarantee Snippet */}
            <div className="flex flex-col items-center text-center gap-1 pt-2">
              <span className="text-[11px] text-default-400">
                Transactions processed securely via Stripe Payments.
              </span>
              <span className="text-[10px] text-default-400 font-medium">
                100% Satisfaction Guarantee or Full Refund.
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
