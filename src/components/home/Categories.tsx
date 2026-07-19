"use client";

import React from "react";
import { motion } from "motion/react";
import { Link } from "@heroui/react";
import { Coffee, Pizza, Salad, Croissant, UtensilsCrossed, Apple } from "lucide-react";

const categories = [
  { name: "Breakfast", icon: Coffee, color: "bg-amber-500/10 text-amber-500" },
  { name: "Lunch", icon: Pizza, color: "bg-orange-500/10 text-orange-500" },
  { name: "Dinner", icon: UtensilsCrossed, color: "bg-rose-500/10 text-rose-500" },
  { name: "Healthy", icon: Salad, color: "bg-emerald-500/10 text-emerald-500" },
  { name: "Desserts", icon: Croissant, color: "bg-pink-500/10 text-pink-500" },
  { name: "Vegan", icon: Apple, color: "bg-green-500/10 text-green-500" },
];

export function Categories() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Explore by <span className="text-gradient-primary">Category</span>
        </h2>
        <p className="text-default-500 max-w-2xl mx-auto">
          Whatever you're craving, we have the perfect recipe. Dive into our handpicked categories and discover your next favorite meal.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {categories.map((category) => (
          <motion.div key={category.name} variants={itemVariants}>
            <Link
              href={`/recipes?category=${category.name.toLowerCase()}`}
              className="flex flex-col items-center justify-center w-full p-6 bg-content1 rounded-3xl border border-divider shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${category.color} group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <span className="font-bold text-foreground text-sm tracking-wide">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
