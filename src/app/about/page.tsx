"use client";

import React from "react";
import { motion } from "framer-motion";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";
import { Users, Heart, Sparkles, Utensils, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";

const coreValues = [
  {
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    title: "Passion for Food",
    description: "We believe that cooking is an art form and sharing recipes is how we pass down culture and love.",
  },
  {
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    title: "Global Community",
    description: "Our platform connects home cooks and professional chefs from every corner of the world.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    title: "Quality & Authenticity",
    description: "Every recipe is a unique creation. We prioritize high-quality, authentic culinary experiences.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: "Trust & Safety",
    description: "We ensure a respectful, safe, and supportive environment for creators to monetize their premium recipes.",
  },
];

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <DynamicBreadcrumb />
          </div>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
              <Utensils className="w-4 h-4" />
              <span>Our Story</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Redefining How the World <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-500">Shares Flavor</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-default-500">
              Flavor Matrix was born out of a simple idea: that everyone has a signature dish worth sharing. We built a platform to empower culinary creators to showcase, share, and monetize their best recipes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-default-50 dark:bg-zinc-900/40 border-y border-default-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              <p className="text-default-500 leading-relaxed text-lg">
                To democratize culinary expertise by giving creators the tools they need to reach a global audience. Whether you're a Michelin-star chef or a passionate home cook, Flavor Matrix provides the canvas for your culinary masterpieces.
              </p>
              <p className="text-default-500 leading-relaxed text-lg">
                We bridge the gap between inspiration and creation, ensuring that every premium recipe is rewarded and every free recipe finds its way to a hungry audience.
              </p>
              <div className="pt-4">
                <Link href="/recipes">
                  <Button variant="primary" size="lg" className="font-bold shadow-lg shadow-primary/30">
                    Explore Recipes
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square md:aspect-auto md:h-[400px] rounded-3xl overflow-hidden glass-panel ambient-glow-orange border-default-200 dark:border-zinc-800 flex items-center justify-center bg-gradient-to-br from-primary/20 to-rose-500/20"
            >
              <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm" />
              <div className="relative z-10 text-center flex flex-col items-center gap-4 p-8">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center mb-2 transform -rotate-6">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">10k+ Creators</h3>
                <p className="text-default-600 dark:text-default-400 font-medium">Sharing their passion daily</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-default-500 text-lg">The principles that guide everything we do at Flavor Matrix.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-default-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-default-500 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
