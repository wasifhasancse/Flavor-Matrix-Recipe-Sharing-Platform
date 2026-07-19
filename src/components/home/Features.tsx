"use client";

import React from "react";
import { motion } from "motion/react";
import { Share2, DollarSign, Users, Award } from "lucide-react";

const features = [
  {
    icon: Share2,
    title: "Share Your Recipes",
    description: "Easily publish your culinary creations with our intuitive recipe builder. Add images, steps, and ingredients in minutes.",
  },
  {
    icon: DollarSign,
    title: "Monetize Your Passion",
    description: "Earn money by selling premium recipes or offering exclusive cooking classes to your dedicated followers.",
  },
  {
    icon: Users,
    title: "Vibrant Community",
    description: "Connect with food enthusiasts from around the world. Share tips, leave reviews, and build your foodie network.",
  },
  {
    icon: Award,
    title: "Earn Recognition",
    description: "Climb the leaderboards, get featured on the homepage, and build your personal brand as a master chef.",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-orange-500 text-sm font-semibold w-fit">
            <SparklesIcon className="w-4 h-4" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            The Ultimate Hub for <br />
            <span className="text-gradient-primary">Culinary Creators</span>
          </h2>
          <p className="text-lg text-default-500 max-w-xl">
            Whether you are a home cook sharing family secrets or a professional chef building a brand, Flavor Matrix provides the tools you need to succeed.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-content1 p-6 rounded-3xl border border-divider shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                <feature.icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-default-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
