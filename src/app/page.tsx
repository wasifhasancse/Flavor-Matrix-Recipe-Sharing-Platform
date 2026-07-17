"use client";

import React from "react";
import { Link, Button } from "@heroui/react";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { motion } from "motion/react";
import { Search, Flame, Sparkles, ChefHat, Compass } from "lucide-react";

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

  const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="flex-grow flex flex-col bg-background text-foreground pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-secondary/5 to-background py-20 px-4 sm:px-6 lg:px-8 border-b border-default-100 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Discover the Taste Universe
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent leading-none">
            Welcome to Flavor Matrix
          </h1>

          <p className="max-w-2xl text-lg text-default-500 leading-relaxed">
            Unleash your culinary creativity. Browse curated recipes, map flavor matrices, and share your delicious creations with a passionate global community of home chefs.
          </p>

          {/* Search Bar mockup */}
          <div className="w-full max-w-lg relative flex items-center shadow-lg rounded-full overflow-hidden bg-background border border-default-200 dark:border-zinc-800 focus-within:border-primary transition-all p-1.5 mt-2">
            <Search className="absolute left-4 h-5 w-5 text-default-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, categories..."
              className="w-full pl-11 pr-24 py-2 text-sm bg-transparent outline-none text-foreground"
            />
            <Button
              variant="primary"
              size="sm"
              className="absolute right-1.5 font-semibold bg-primary text-primary-foreground rounded-full px-5 py-2"
            >
              Search
            </Button>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 items-center mt-4">
            <Link href="/recipes" className="no-underline">
              <Button
                variant="primary"
                size="md"
                className="font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Explore Recipes
              </Button>
            </Link>
            <Link href="/register" className="no-underline">
              <Button
                variant="outline"
                size="md"
                className="font-bold border border-default-300 dark:border-zinc-700 text-foreground hover:bg-default-100 dark:hover:bg-zinc-800 transition-colors rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4 text-primary" />
                Join Community
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

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
