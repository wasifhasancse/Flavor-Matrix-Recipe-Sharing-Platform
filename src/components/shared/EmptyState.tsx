"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  /** Dynamic icon element or Lucide icon component */
  icon?: React.ReactNode | LucideIcon;
  /** Bold high-contrast title header */
  title: string;
  /** Contextual description text */
  description: string;
  /** Optional CTA button label */
  actionLabel?: string;
  /** Optional CTA routing link */
  actionLink?: string;
  /** Optional CTA button onClick handler */
  onAction?: () => void | Promise<unknown>;
  /** Custom icon container color accent */
  variant?: "primary" | "emerald" | "amber" | "rose" | "purple";
  /** Optional custom container class overrides */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  variant = "primary",
  className = "",
}) => {
  // Determine color theme for icon container badge & glow
  const colorStyles = {
    primary: "bg-primary/10 text-primary border-primary/20 shadow-primary/10",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/10",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/10",
  }[variant];

  const buttonGradient = {
    primary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20",
    amber: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20",
    rose: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/20",
    purple: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-purple-500/20",
  }[variant];

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as Record<string, unknown>))) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="h-10 w-10 stroke-[2]" />;
    }

    return icon;
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto min-h-[400px] w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center bg-content1/60 dark:bg-zinc-900/60 backdrop-blur-md border border-divider dark:border-zinc-800/80 rounded-2xl p-8 sm:p-10 shadow-sm"
      >
        {/* Dynamic Icon Container with Soft Background Glow */}
        {icon && (
          <div className="relative mb-2 flex items-center justify-center">
            {/* Soft Ambient Radial Glow */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-60 ${colorStyles}`} />
            
            {/* Icon Circle */}
            <div className={`relative h-20 w-20 rounded-full border flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${colorStyles}`}>
              {renderIcon()}
            </div>
          </div>
        )}

        {/* Title Header */}
        <h3 className="text-xl font-bold text-foreground mt-4 tracking-tight">
          {title}
        </h3>

        {/* Description Text */}
        <p className="text-default-500 text-sm mt-2 max-w-sm px-4 leading-relaxed">
          {description}
        </p>

        {/* Optional Action Button */}
        {actionLabel && (
          <div className="mt-6">
            {actionLink ? (
              <Link href={actionLink} className="no-underline">
                <Button
                  
                  className={`btn-primary text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg border-none cursor-pointer ${buttonGradient}`}
                >
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button
                
                onClick={onAction}
                className={`btn-primary text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg border-none cursor-pointer ${buttonGradient}`}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmptyState;
