"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";
import { Button } from "@heroui/react";
import { CheckCircle2, Loader2, Crown, Zap, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

function PricingSuccessContent() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!sessionId || !plan || !session?.user) {
      if (!sessionLoading) {
        setIsVerifying(false);
      }
      return;
    }

    const verifySubscription = async () => {
      try {
        const res = await fetch("/api/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, plan, amount }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to verify subscription.");
        }
        
        // Remove old localStorage cache just in case
        localStorage.removeItem(`is_premium_account_${session.user.id}`);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySubscription();
  }, [sessionId, plan, amount, session, sessionLoading]);

  if (sessionLoading || isVerifying) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-foreground">Verifying Your Subscription...</h2>
        <p className="text-default-500 mt-2">Securing your new chef tier.</p>
      </div>
    );
  }

  if (error || !sessionId || !plan) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        <AlertTriangle className="h-16 w-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Verification Failed</h1>
        <p className="text-default-500 mb-8">
          {error || "We couldn't verify this subscription session. Please contact support if you were charged."}
        </p>
        <Link href="/pricing" className="w-full">
          <Button  className="btn-secondary w-full font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
            Return to Pricing
          </Button>
        </Link>
      </div>
    );
  }

  const isPremium = plan === "premium";

  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`max-w-md w-full p-8 sm:p-10 rounded-[2rem] glass-panel text-center border relative overflow-hidden ${
          isPremium ? "border-amber-500/40 shadow-2xl shadow-amber-500/20" : "border-orange-500/40 shadow-2xl shadow-orange-500/20"
        }`}
      >
        <div className={`absolute top-0 left-0 w-full h-2 ${isPremium ? "bg-amber-500" : "bg-orange-500"}`} />

        <div className="mb-6 flex justify-center relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150" />
          <CheckCircle2 className="h-20 w-20 text-emerald-500 relative z-10 drop-shadow-md" />
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-2">Subscription Activated!</h1>
        <p className="text-default-500 mb-8 font-medium">
          Welcome to the {isPremium ? "Gold Premium" : "Pro Chef"} tier. Your account has been upgraded successfully.
        </p>

        <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl mb-8 ${
          isPremium ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
        }`}>
          {isPremium ? <Crown className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          <span className="font-extrabold tracking-wide uppercase">
            {isPremium ? "Premium Features Unlocked" : "Pro Features Unlocked"}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard/user/profile" className="w-full">
            <Button
              className={`w-full font-bold shadow-lg ${
                isPremium ? "bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600" : "bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600"
              }`}
            >
              View Your Chef Profile
            </Button>
          </Link>
          <Link href="/dashboard/user/add-recipe" className="w-full">
            <Button  className="btn-secondary w-full font-bold border-default-200">
              Publish a New Recipe <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      }>
        <PricingSuccessContent />
      </Suspense>
    </div>
  );
}
