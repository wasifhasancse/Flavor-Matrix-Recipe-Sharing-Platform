"use client";

import { motion } from "motion/react";

const stats = [
  { label: "Active Chefs", value: "50k+" },
  { label: "Recipes Shared", value: "120k+" },
  { label: "Monthly Users", value: "2M+" },
  { label: "Countries", value: "150+" },
];

export function Statistics() {
  return (
    <section className="mt-24 w-full">
      <div className="relative overflow-hidden py-16 bg-linear-to-r from-orange-500 via-amber-500 to-rose-500">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center divide-y divide-white/20 md:divide-y-0 md:divide-x">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center justify-center py-4 md:py-0"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-white/80 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
