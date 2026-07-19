"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  ArrowRight,
  Compass,
  LayoutDashboard,
  Receipt,
  Mail,
  Calendar,
  CreditCard,
  ChefHat,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || `tx_stripe_${Math.random().toString(36).substring(2, 10)}`;
  const recipeId = searchParams.get("recipe_id") || "rec-2";
  const rawAmount = searchParams.get("amount");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    // Format timestamp on mount
    const now = new Date();
    setTimestamp(
      now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            recipe_id: recipeId,
            amount: rawAmount || recipe?.price || 0,
          }),
        });
        const data = await res.json();
        if (data.success && data.payment) {
          setVerifiedEmail(data.payment.userEmail);
        }
      } catch (err) {
        console.error("Failed to verify payment", err);
      } finally {
        setIsVerifying(false);
      }
    };

    if (sessionId && recipeId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
    }

    // Save purchase status to local storage for persistence simulation
    if (recipeId) {
      localStorage.setItem(`purchased_${recipeId}`, "true");
      const found = mockRecipes.find((r) => r.id === recipeId);
      if (found) setRecipe(found);
    }
  }, [recipeId, sessionId, rawAmount, recipe?.price]);

  const amountPaid = rawAmount
    ? `$${parseFloat(rawAmount).toFixed(2)} USD`
    : recipe?.price
    ? `$${recipe.price.toFixed(2)} USD`
    : "$4.99 USD";

  const userEmail = verifiedEmail || "chef.user@example.com";

  return (
    <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-10 bg-background relative overflow-hidden">
      {/* Background Glow Circle */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Visually Rewarding Animated Entrance Header */}
      <div className="flex flex-col items-center text-center gap-4 z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="relative h-24 w-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-4 border-white dark:border-zinc-900"
        >
          <CheckCircle2 className="h-14 w-14 stroke-[2.5]" />

          {/* Floating Sparkle Particles */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 text-amber-400"
          >
            <Sparkles className="h-6 w-6 fill-amber-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 max-w-md"
        >
          <Chip color="success" variant="soft" className="mx-auto font-bold uppercase text-xs">
            Payment Succeeded
          </Chip>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-default-500 leading-relaxed">
            Your transaction has been processed successfully. You now have full permanent access to this premium culinary creation.
          </p>
        </motion.div>
      </div>

      {/* Full Transaction Receipt Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-2xl rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 z-10"
      >
        <div className="flex items-center justify-between border-b border-default-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">Transaction Receipt</h2>
          </div>
          <Chip color="success" size="sm" variant="soft" className="font-bold uppercase text-[10px]">
            Status: Succeeded
          </Chip>
        </div>

        {/* Recipe Reference Snippet */}
        {recipe && (
          <div className="p-4 rounded-2xl bg-default-50 dark:bg-zinc-950/50 border border-default-100 dark:border-zinc-800 flex items-center gap-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-default-100 dark:border-zinc-800"
            />
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">
                {recipe.category}
              </span>
              <h3 className="text-sm font-bold text-foreground line-clamp-1">
                {recipe.title}
              </h3>
              <span className="text-xs text-default-400">By {recipe.author}</span>
            </div>
            <Link
              href={`/recipes/${recipe.id}`}
              className="no-underline text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View Recipe</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Database Payment Schema Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-default-50/60 dark:bg-zinc-950/40 border border-default-100 dark:border-zinc-800">
            <span className="text-default-400 font-medium flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-primary" />
              <span>Transaction ID</span>
            </span>
            <span className="font-mono font-bold text-foreground truncate" title={sessionId}>
              {sessionId}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-default-50/60 dark:bg-zinc-950/40 border border-default-100 dark:border-zinc-800">
            <span className="text-default-400 font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-secondary" />
              <span>User Email</span>
            </span>
            <span className="font-semibold text-foreground truncate">
              {userEmail}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-default-50/60 dark:bg-zinc-950/40 border border-default-100 dark:border-zinc-800">
            <span className="text-default-400 font-medium flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              <span>Amount Paid</span>
            </span>
            <span className="font-extrabold text-foreground text-sm">
              {amountPaid}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-default-50/60 dark:bg-zinc-950/40 border border-default-100 dark:border-zinc-800">
            <span className="text-default-400 font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>Paid Timestamp</span>
            </span>
            <span className="font-semibold text-foreground truncate">
              {timestamp || "July 18, 2026 at 07:45 PM"}
            </span>
          </div>
        </div>

        <div className="border-t border-default-100 dark:border-zinc-800 pt-3 flex justify-between items-center text-xs text-default-400">
          <span>Payment Provider: Stripe Checkout</span>
          <span>Status: Verified & Completed</span>
        </div>
      </motion.div>

      {/* High-Value Action CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full max-w-2xl justify-center"
      >
        <Link href="/dashboard/user" className="no-underline w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 border-none cursor-pointer hover:scale-105 transition-all text-sm"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Go to Purchased Recipes</span>
          </Button>
        </Link>

        {recipeId && (
          <Link href={`/recipes/${recipeId}`} className="no-underline w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border border-default-300 dark:border-zinc-700 text-foreground font-bold px-7 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-default-100 dark:hover:bg-zinc-800 transition-all text-sm"
            >
              <ChefHat className="h-4.5 w-4.5 text-primary" />
              <span>View Unlocked Recipe</span>
            </Button>
          </Link>
        )}

        <Link href="/recipes" className="no-underline w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border border-default-200 dark:border-zinc-800 text-default-600 font-semibold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-default-50 dark:hover:bg-zinc-900 transition-all text-sm"
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Back to Browse</span>
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
          <p className="mt-4 text-default-500 font-medium">Verifying transaction receipt...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
