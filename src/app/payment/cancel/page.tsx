"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { motion } from "motion/react";
import {
  ShieldAlert,
  RotateCcw,
  Compass,
  Headphones,
  ArrowLeft,
  XCircle,
  HelpCircle,
  Lock,
} from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("recipe_id") || "rec-2";

  return (
    <div className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center gap-8 bg-background relative">
      {/* Background Warning Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Cancellation Warning Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative h-24 w-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/25 border-4 border-white dark:border-zinc-900 z-10"
      >
        <ShieldAlert className="h-12 w-12 stroke-[2.2]" />
      </motion.div>

      {/* Header Text & Context Message */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-3 max-w-lg z-10"
      >
        <Chip color="danger" variant="soft" className="font-bold uppercase text-xs">
          Transaction Cancelled
        </Chip>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Payment Process Interrupted
        </h1>

        <p className="text-sm sm:text-base text-default-500 leading-relaxed">
          Your payment attempt was cancelled or declined. No charges were made to your account. You can safely attempt the purchase again whenever you&apos;re ready.
        </p>
      </motion.div>

      {/* Context Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md p-6 rounded-3xl border border-default-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl flex flex-col gap-4 text-left z-10"
      >
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>Why Did This Happen?</span>
        </h3>

        <ul className="flex flex-col gap-2.5 text-xs text-default-500 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span>The Checkout tab or window was closed before finishing.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span>The card issuer declined authorization or 3D Secure timed out.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span>You clicked &ldquo;Cancel and return&rdquo; during payment redirect.</span>
          </li>
        </ul>
      </motion.div>

      {/* Actionable CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full max-w-md justify-center"
      >
        <Link href={`/checkout/${recipeId}`} className="no-underline w-full sm:w-auto">
          <Button
            
            size="lg"
            className="btn-primary w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 border-none cursor-pointer hover:scale-105 transition-all text-sm"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            <span>Try Payment Again</span>
          </Button>
        </Link>

        <a
          href="mailto:support@flavormatrix.com?subject=Payment%20Issue%20Support"
          className="no-underline w-full sm:w-auto"
        >
          <Button
            
            size="lg"
            className="btn-secondary w-full sm:w-auto border border-default-300 dark:border-zinc-700 text-foreground font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-default-100 dark:hover:bg-zinc-800 transition-all text-sm"
          >
            <Headphones className="h-4.5 w-4.5 text-primary" />
            <span>Contact Support</span>
          </Button>
        </a>

        <Link href="/recipes" className="no-underline w-full sm:w-auto">
          <Button
            
            size="lg"
            className="btn-secondary w-full sm:w-auto border border-default-200 dark:border-zinc-800 text-default-600 font-semibold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-default-50 dark:hover:bg-zinc-900 transition-all text-sm"
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Browse Recipes</span>
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
          <p className="mt-4 text-default-500 font-medium">Loading cancellation details...</p>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
