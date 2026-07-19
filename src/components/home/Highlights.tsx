"use client";

import React from "react";
import { motion } from "motion/react";
import { Award, ArrowRight } from "lucide-react";
import { Link, Button } from "@heroui/react";

export function Highlights() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full">
      <div className="bg-content1 rounded-[2.5rem] border border-divider p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-sm">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop"
                alt="Chef of the Month"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-2xl shadow-lg border border-divider flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-default-500 font-bold uppercase tracking-wider">Rank #1</p>
                <p className="font-extrabold text-foreground">Top Creator</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-sm font-bold uppercase tracking-wider w-fit">
              Chef of the Month
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Meet <span className="text-gradient-rose">Chef Gordon</span>
            </h2>
            <p className="text-lg text-default-600 leading-relaxed">
              With over 500 published recipes and 2 million saves, Chef Gordon has redefined home cooking for our community. His innovative approach to classic French cuisine makes gourmet cooking accessible to everyone.
            </p>
            
            <div className="flex gap-4 pt-4">
              <Link href="/community">
                <Button size="lg" className="bg-primary font-bold shadow-lg shadow-primary/30 text-white rounded-xl">
                  View Profile
                </Button>
              </Link>
              <Link href="/recipes">
                <Button variant="outline" size="lg" className="font-bold border-default-200 dark:border-zinc-700 rounded-xl">
                  Try His Recipes
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
