"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Sparkles, Bot, ChefHat } from "lucide-react";
import Link from "next/link";

export const AIFeatures = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-default-50/50 dark:bg-black w-full mt-20">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-semibold mb-4 border border-purple-500/20">
                <Sparkles className="h-4 w-4" />
                <span>Next-Gen Culinary Experience</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500">Intelligence</span>
              </h2>
              <p className="text-default-500 dark:text-zinc-400 text-lg max-w-xl">
                We've integrated state-of-the-art AI features to elevate your cooking journey. Discover our two flagship AI tools designed to make every meal extraordinary.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Feature 1 */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-background border border-default-200 dark:border-zinc-800/80 shadow-lg dark:shadow-none overflow-hidden transition-all duration-300 hover:border-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <Bot className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">AI Chat Assistant</h3>
                  </div>
                  <p className="text-default-500 dark:text-zinc-400 mb-4 text-sm leading-relaxed">
                    <strong className="text-foreground">Benefit:</strong> Get instant culinary advice, cooking tips, and answers to any food-related queries 24/7. Perfect for troubleshooting recipes on the fly.
                  </p>
                  <div className="bg-default-100 dark:bg-zinc-900/50 p-4 rounded-xl text-sm border border-default-200 dark:border-zinc-800 text-foreground">
                    <span className="font-semibold block mb-1 text-purple-500">How to use:</span>
                    Simply click the floating chat icon <Bot className="inline h-4 w-4 mx-1"/> in the bottom right corner of your screen at any time to start a conversation with your personal sous-chef.
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-background border border-default-200 dark:border-zinc-800/80 shadow-lg dark:shadow-none overflow-hidden transition-all duration-300 hover:border-orange-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">AI Recipe Generator</h3>
                  </div>
                  <p className="text-default-500 dark:text-zinc-400 mb-4 text-sm leading-relaxed">
                    <strong className="text-foreground">Benefit:</strong> Reduce food waste and discover creative new meals. Turn random ingredients from your fridge into a gourmet masterpiece.
                  </p>
                  <div className="bg-default-100 dark:bg-zinc-900/50 p-4 rounded-xl text-sm border border-default-200 dark:border-zinc-800 text-foreground">
                    <span className="font-semibold block mb-1 text-orange-500">How to use:</span>
                    Navigate to our <Link href="/recipes" className="underline font-medium hover:text-orange-500 transition-colors">Recipes page</Link> and look for the &quot;Generate with AI&quot; button. Enter what you have, and let the magic happen.
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:ml-10 mt-10 lg:mt-0"
          >
            {/* Glowing effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-orange-500/30 blur-3xl rounded-full transform scale-90" />
            
            <div className="relative rounded-3xl overflow-hidden border border-default-200 dark:border-zinc-800 shadow-2xl aspect-[4/5] w-full max-w-md mx-auto">
              <Image 
                src="/images/ai-feature.png" 
                alt="Futuristic AI Chef Interface" 
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              {/* Overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Floating element */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-3 text-white">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium">AI Systems Online & Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
