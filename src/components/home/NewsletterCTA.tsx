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
        className="relative overflow-hidden rounded-[2.5rem] bg-content1 border border-divider shadow-xl flex flex-col lg:flex-row items-center"
      >
        {/* Left Content Column */}
        <div className="relative z-10 flex flex-col p-10 md:p-16 lg:w-1/2 gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit mb-2">
            <Mail className="w-4 h-4" />
            <span>Weekly Newsletter</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Get Fresh Recipes <br /> Delivered <span className="text-gradient-primary">Weekly</span>
          </h2>
          
          <p className="text-lg text-default-500 max-w-xl">
            Join 50,000+ foodies who receive our hand-curated recipe collections, cooking tips, and platform updates every Friday.
          </p>

          <form className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-default-100 dark:bg-zinc-900 border border-transparent focus:border-primary focus:bg-background rounded-xl px-5 py-4 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
            <Button size="lg" className="bg-primary h-[58px] px-8 font-bold text-white rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2">
              Subscribe
              <Sparkles className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-default-400 mt-2">
            We respect your inbox. No spam, ever. Unsubscribe at any time.
          </p>
        </div>

        {/* Right Image Column */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-full relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-r from-content1 via-content1/50 to-transparent z-10 hidden lg:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-content1 via-content1/50 to-transparent z-10 block lg:hidden"></div>
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
            alt="Fresh healthy ingredients"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
