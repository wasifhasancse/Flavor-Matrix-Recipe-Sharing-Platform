"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Prevent hydration mismatch artifacts on initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-2xl bg-default-100 dark:bg-zinc-800 animate-pulse border border-default-200 dark:border-zinc-800" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      isIconOnly
      variant="outline"
      size="sm"
      onPress={toggleTheme}
      aria-label="Toggle Global Theme"
      className="w-9 h-9 rounded-2xl border border-default-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md hover:bg-default-100 dark:hover:bg-zinc-800 text-foreground transition-all cursor-pointer flex items-center justify-center shadow-sm"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4 text-amber-400 fill-amber-400/20" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

export default ThemeSwitcher;
