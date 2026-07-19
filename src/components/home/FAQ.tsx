"use client";

import React from "react";
import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is Flavor Matrix free to use?",
    answer: "Yes! Creating an account, browsing recipes, and interacting with the community is completely free. We also offer premium recipes and cooking classes created by top chefs for a fee.",
  },
  {
    question: "How do I monetize my recipes?",
    answer: "Once you create an account, you can mark specific recipes or collections as 'Premium'. Users will need to purchase access to view these recipes, and you'll earn a majority percentage of the revenue.",
  },
  {
    question: "Can I save recipes to view offline?",
    answer: "Absolutely. You can bookmark your favorite recipes to your personal collection, which is easily accessible from your dashboard anytime.",
  },
  {
    question: "How do I become a verified chef?",
    answer: "Verified chef status is awarded to creators who consistently publish high-quality content and maintain excellent community ratings. You can apply for verification through your user settings once you reach 50 published recipes.",
  },
  {
    question: "Is there a mobile app available?",
    answer: "Currently, Flavor Matrix is a fully responsive web application that works beautifully on all mobile devices. A native iOS and Android app is in development and coming soon!",
  },
];

export function FAQ() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Frequently Asked <span className="text-gradient-primary">Questions</span>
        </h2>
        <p className="text-default-500">
          Everything you need to know about Flavor Matrix and how it works.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4"
      >
        {faqs.map((faq, index) => (
          <details 
            key={index} 
            className="group bg-content1 border border-divider shadow-sm rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="font-bold text-foreground py-5 px-6 cursor-pointer list-none flex justify-between items-center hover:bg-default-100/50 transition-colors">
              <span>{faq.question}</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="text-default-600 px-6 pb-6 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </motion.div>
    </section>
  );
}
