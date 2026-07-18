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
        <div className="flex items-center justify-between mb-8 border-b border-default-100 dark:border-zinc-800/80 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 fill-amber-400" />
              <span>Chef Handpicked</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500">
              Featured Creations
            </h2>
          </div>
          <Link href="/recipes" className="text-xs font-bold text-primary hover:text-orange-500 transition-colors flex items-center gap-1">
            <span>Explore All Featured</span>
            <span>&rarr;</span>
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
        <div className="flex items-center justify-between mb-8 border-b border-default-100 dark:border-zinc-800/80 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
              <Flame className="h-4 w-4 fill-rose-500" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500">
              Popular Recipes
            </h2>
          </div>
          <Link href="/recipes" className="text-xs font-bold text-primary hover:text-rose-500 transition-colors flex items-center gap-1">
            <span>Explore Trending</span>
            <span>&rarr;</span>
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
