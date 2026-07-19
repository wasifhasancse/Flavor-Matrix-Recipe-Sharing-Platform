"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { motion } from "motion/react";
import { Compass, Sparkles, ArrowRight } from "lucide-react";

// Import Swiper core and module styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export interface BannerSlide {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
}

export interface BannerProps {
  slides?: BannerSlide[];
  autoPlayDelay?: number;
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: "slide-1",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1920&q=80",
    badge: "Featured Recipe",
    title: "Master the Art of Authentic Italian Pasta",
    description:
      "Indulge in rich, creamy Spaghetti Carbonara crafted with aged Pecorino Romano and crisp guanciale. Elevate your culinary journey today.",
  },
  {
    id: "slide-2",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1920&q=80",
    badge: "Chef's Special",
    title: "Exotic & Fragrant Thai Culinary Creations",
    description:
      "Immerse your senses in vibrant Thai green curry steeped in fresh coconut milk, kaffir lime leaves, and aromatic herbs.",
  },
  {
    id: "slide-3",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1920&q=80",
    badge: "Trending Flavor",
    title: "Crispy Golden Avocado Street Tacos",
    description:
      "Savor panko-crusted fried avocado wedges topped with zesty lime crema, fresh cilantro, and pickled red onions.",
  },
  {
    id: "slide-4",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1920&q=80",
    badge: "Decadent Dessert",
    title: "Warm Molten Chocolate Lava Cakes",
    description:
      "Experience pure indulgence with a soft, rich chocolate cake concealing a silky, flowing molten center.",
  },
];

// Framer Motion Animation Variants for Staggered Slide-up Effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

export function Banner({ slides = DEFAULT_SLIDES, autoPlayDelay = 5000 }: BannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950">
      {/* Custom Swiper Pagination Styling */}
      <style>{`
        .recipe-banner-swiper .swiper-pagination {
          bottom: 24px !important;
          left: 0 !important;
          right: 0 !important;
          max-width: 80rem !important;
          margin: 0 auto !important;
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
          display: flex !important;
          justify-content: flex-start !important;
          gap: 8px !important;
          z-index: 30 !important;
        }
        @media (min-width: 640px) {
          .recipe-banner-swiper .swiper-pagination {
            padding-left: 2rem !important;
          }
        }
        @media (min-width: 1024px) {
          .recipe-banner-swiper .swiper-pagination {
            padding-left: 2rem !important;
          }
        }
        .recipe-banner-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 0.8;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 !important;
          cursor: pointer;
        }
        .recipe-banner-swiper .swiper-pagination-bullet-active {
          width: 32px;
          background: #f97316;
          opacity: 1;
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.7);
        }
      `}</style>

      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={1000}
        autoplay={{
          delay: autoPlayDelay,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="recipe-banner-swiper w-full h-[520px] sm:h-[600px] lg:h-[650px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
            {/* Background Culinary Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />

            {/* Banner Content Container */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              {/* Glassmorphism Text Card */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl backdrop-blur-sm bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl text-white flex flex-col items-start gap-4"
              >
                {/* Badge Tag */}
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                  <span>{slide.badge}</span>
                </motion.div>

                {/* Striking Title */}
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
                >
                  {slide.title}
                </motion.h1>

                {/* Concise Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed max-w-xl font-normal"
                >
                  {slide.description}
                </motion.p>

                {/* Primary HeroUI CTA Button with Motion Micro-Interactions */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2"
                >
                  <Link href="/recipes" className="no-underline inline-block">
                    <Button
                      
                      size="lg"
                      className="btn-primary font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 rounded-xl px-7 py-3.5 flex items-center gap-2.5 text-base border-none cursor-pointer"
                    >
                      <Compass className="h-5 w-5" />
                      <span>Explore Recipes</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default Banner;
