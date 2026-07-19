"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@heroui/react";
import { Mail, Sparkles } from "lucide-react";

export function NewsletterCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-12 w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-900 dark:to-zinc-950 p-10 md:p-16 lg:p-20 text-center shadow-2xl border border-zinc-800"
      >
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1/2 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto gap-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Get Fresh Recipes <br /> Delivered <span className="text-primary">Weekly</span>
          </h2>
          
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Join 50,000+ foodies who receive our hand-curated recipe collections, cooking tips, and platform updates every Friday.
          </p>

          <form className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
            <Button size="lg" className="bg-primary h-[58px] px-8 font-bold text-white rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
              Subscribe
              <Sparkles className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-zinc-500 mt-2">
            We respect your inbox. No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
