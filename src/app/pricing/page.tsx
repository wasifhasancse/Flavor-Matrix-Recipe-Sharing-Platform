"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";
import { Button, Chip } from "@heroui/react";
import { Check, Star, Zap, Crown, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  const { data: session, isPending } = authClient.useSession();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/subscription/verify")
        .then((res) => res.json())
        .then((data) => {
          setCurrentPlan(data.plan || "free");
          setIsLoadingPlan(false);
        })
        .catch(() => {
          setCurrentPlan("free");
          setIsLoadingPlan(false);
        });
    } else {
      setIsLoadingPlan(false);
    }
  }, [session]);

  const plans = [
    {
      id: "free",
      name: "Standard",
      price: "$0",
      duration: "Forever",
      icon: <Star className="h-6 w-6 text-default-500" />,
      description: "Perfect for getting started and sharing your first creations.",
      features: [
        "Create up to 2 recipes (Lifetime)",
        "Browse unlimited recipes",
        "Save recipes to favorites",
        "Community forum access",
      ],
      buttonText: "Current Plan",
      buttonVariant: "bordered",
      popular: false,
    },
    {
      id: "pro",
      name: "Chef Pro",
      price: "$9.99",
      duration: "Per month",
      icon: <Zap className="h-6 w-6 text-sky-500" />,
      description: "For passionate cooks who share new dishes regularly.",
      features: [
        "Create up to 10 recipes per month",
        "Access to basic analytics",
        "Pro Chef Profile Badge",
        "Priority community support",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "solid",
      buttonClass: "bg-sky-500 text-white font-bold",
      popular: true,
    },
    {
      id: "premium",
      name: "Gold Premium",
      price: "$24.99",
      duration: "Per year",
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      description: "The ultimate package for professional chefs and heavy users.",
      features: [
        "Unlimited recipe creation",
        "Advanced sales & analytics dashboard",
        "Gold Premium Profile Badge",
        "Sell premium recipes",
      ],
      buttonText: "Upgrade to Premium",
      buttonVariant: "solid",
      buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 mb-4"
            >
              <Sparkles className="h-4 w-4" />
              <span>Unlock Your Culinary Potential</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight"
            >
              Simple Pricing for <span className="text-gradient-primary">Every Chef</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-default-500 max-w-2xl mx-auto text-lg"
            >
              Whether you're just sharing family secrets or building a culinary empire,
              we have a plan tailored for your journey.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => {
              const isCurrent = currentPlan === plan.id;
              const isDowngrade =
                (currentPlan === "premium" && plan.id !== "premium") ||
                (currentPlan === "pro" && plan.id === "free");

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`relative flex flex-col p-8 rounded-3xl glass-panel ${
                    plan.popular
                      ? "border-sky-500/50 shadow-2xl shadow-sky-500/10 md:-translate-y-4"
                      : "border-divider dark:border-zinc-800"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Chip color="accent" className="bg-sky-500 font-bold px-4 shadow-lg shadow-sky-500/20 text-white border-none">
                        Most Popular
                      </Chip>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-default-100 dark:bg-zinc-800/50">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-default-400 font-medium ml-1">/ {plan.duration}</span>
                  </div>

                  <p className="text-default-500 text-sm mb-8 min-h-[40px]">
                    {plan.description}
                  </p>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button Action */}
                  <div className="mt-auto">
                    {isPending || isLoadingPlan ? (
                      <Button className="w-full font-bold" isDisabled>Loading...</Button>
                    ) : !session ? (
                      <Link href="/login" className="w-full">
                        <Button
                          variant={plan.buttonVariant as any}
                          className={`w-full font-bold ${plan.buttonClass || "border-default-200"}`}
                        >
                          Log in to upgrade
                        </Button>
                      </Link>
                    ) : isCurrent ? (
                      <Button
                        isDisabled
                        className="w-full font-bold bg-default-100 dark:bg-zinc-800 text-default-500"
                      >
                        Current Plan
                      </Button>
                    ) : isDowngrade ? (
                      <Button
                        isDisabled
                        className="w-full font-bold bg-default-100 dark:bg-zinc-800 text-default-500"
                      >
                        Unavailable
                      </Button>
                    ) : (
                      <form action="/api/subscription/checkout" method="POST">
                        <input type="hidden" name="plan" value={plan.id} />
                        <Button
                          type="submit"
                          variant={plan.buttonVariant as any}
                          className={`w-full font-bold ${plan.buttonClass || ""}`}
                        >
                          {plan.buttonText} <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </form>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Decorative Image/Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto rounded-3xl overflow-hidden relative border border-default-200 dark:border-zinc-800 shadow-2xl shadow-primary/10 group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
              alt="Culinary Excellence"
              className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                Join thousands of top chefs.
              </h2>
              <p className="text-white/80 font-medium">
                Elevate your culinary journey today with Flavor Matrix Pro and Premium tiers.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
