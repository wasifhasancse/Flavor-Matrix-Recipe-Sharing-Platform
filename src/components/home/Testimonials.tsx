"use client";

import React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Home Cook",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    quote: "Flavor Matrix completely changed how I cook. The community is so supportive and the recipes are top-notch!",
  },
  {
    name: "Chef Marco",
    role: "Professional Chef",
    image: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    quote: "An incredible platform to showcase my culinary creations and connect directly with food enthusiasts.",
  },
  {
    name: "Emily Chen",
    role: "Food Blogger",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    quote: "I've discovered so many unique flavor profiles here. The monetization tools for creators are also a huge plus.",
  }
];

export function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Loved by <span className="text-gradient-rose">Thousands</span>
        </h2>
        <p className="text-default-500 max-w-2xl mx-auto">
          Don't just take our word for it. Hear what our amazing community of chefs and food lovers have to say.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-content1 p-8 rounded-3xl border border-divider shadow-sm relative"
          >
            <div className="flex gap-1 text-amber-400 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-default-600 mb-8 italic">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-4 mt-auto">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                <p className="text-xs text-default-500 font-medium">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
