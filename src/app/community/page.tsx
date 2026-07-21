"use client";
import { motion } from "framer-motion";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";
import { MessageSquare, Users, Star, TrendingUp, Compass, Award } from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";

const communityFeatures = [
  {
    icon: <MessageSquare className="w-6 h-6 text-orange-500" />,
    title: "Discuss & Connect",
    description: "Join forums, comment on recipes, and connect with chefs and food lovers globally.",
  },
  {
    icon: <Award className="w-6 h-6 text-emerald-500" />,
    title: "Earn Badges",
    description: "Get recognized for your contributions, popular recipes, and helpful advice.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-rose-500" />,
    title: "Weekly Challenges",
    description: "Participate in themed cooking challenges and win premium subscriptions.",
  },
];

const topContributors = [
  { name: "Chef Isabella", role: "Master Chef", followers: "12.4k", initial: "I", color: "bg-rose-500" },
  { name: "Marcus Cooks", role: "Home Expert", followers: "8.1k", initial: "M", color: "bg-blue-500" },
  { name: "Sarah's Kitchen", role: "Baker", followers: "15.2k", initial: "S", color: "bg-amber-500" },
  { name: "Kenji Moto", role: "Sushi Master", followers: "19.8k", initial: "K", color: "bg-emerald-500" },
];

export default function CommunityPage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm font-semibold mb-2">
              <Users className="w-4 h-4" />
              <span>Join the Movement</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Welcome to the <span className="text-gradient-primary whitespace-nowrap">Flavor Matrix</span> Community
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-default-500">
              The ultimate gathering place for food enthusiasts. Share your culinary journey, learn from experts, and celebrate the art of cooking together.
            </motion.p>
            <motion.div variants={itemVariants} className="flex gap-4 pt-4">
              <Link href="/register">
                <Button  size="lg" className="btn-primary font-bold shadow-lg ">
                  Join Now
                </Button>
              </Link>
              <Link href="/recipes">
                <Button  size="lg" className="btn-secondary font-bold border-default-200 dark:border-zinc-800 hover:bg-default-100">
                  Explore Recipes
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-content1/30 border-y border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {communityFeatures.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-panel p-8 rounded-3xl border border-divider hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-content1 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-default-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                Top Contributors
              </h2>
              <p className="text-default-500 text-lg">Meet the culinary artists who are inspiring thousands with their unique creations and premium recipes.</p>
            </div>
            <Button  className="btn-secondary font-semibold px-6 hidden md:flex text-primary border-primary">
              View Leaderboard
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topContributors.map((contributor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-content1 border border-divider shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-20 h-20 rounded-full ${contributor.color} text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                  {contributor.initial}
                </div>
                <h3 className="text-lg font-bold text-foreground">{contributor.name}</h3>
                <p className="text-orange-500 text-sm font-medium mb-3">{contributor.role}</p>
                <div className="w-full pt-4 border-t border-divider flex justify-between items-center px-2">
                  <span className="text-xs text-default-400 font-medium">Followers</span>
                  <span className="text-sm font-bold text-foreground">{contributor.followers}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 md:hidden flex justify-center">
            <Button  className="btn-secondary font-semibold px-6 w-full sm:w-auto text-primary border-primary">
              View Leaderboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
