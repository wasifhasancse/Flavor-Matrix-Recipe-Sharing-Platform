"use client";

import Link from "next/link";
import { Banner } from "@/components/home/Banner";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { motion } from "motion/react";
import { Flame, Sparkles } from "lucide-react";

export default function Home() {
  // Extract Featured Recipes
  const featuredRecipes = mockRecipes.filter((r) => r.isFeatured);

  // Extract Popular Recipes sorted by likes count descending
  const popularRecipes = [...mockRecipes].sort((a, b) => b.likes - a.likes).slice(0, 4);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="flex-grow flex flex-col bg-background text-foreground pb-20">
      {/* 1. Hero Swiper Banner */}
      <Banner />

      {/* 2. Featured Recipes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Chef Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Creations
            </h2>
          </div>
          <Link href="/recipes" className="text-sm font-semibold text-primary hover:underline">
            View all featured &rarr;
          </Link>
        </div>

        {/* Animated grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredRecipes.map((recipe) => (
            <motion.div key={recipe.id} variants={cardVariants} className="flex">
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Popular Recipes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-danger font-semibold text-sm uppercase tracking-wider">
              <Flame className="h-4 w-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Popular Recipes
            </h2>
          </div>
          <Link href="/recipes" className="text-sm font-semibold text-primary hover:underline">
            View all popular &rarr;
          </Link>
        </div>

        {/* Regular responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
}
