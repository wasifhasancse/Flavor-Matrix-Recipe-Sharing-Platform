import React from "react";
import { Link, Button } from "@heroui/react";
import { Compass, FlameKindling, ChefHat, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] bg-background text-foreground transition-colors p-6 text-center">
      {/* Visual illustration box */}
      <div className="relative flex items-center justify-center h-32 w-32 mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse border border-primary/20" />
        <div className="absolute inset-4 bg-secondary/10 rounded-full border border-secondary/20" />
        <ChefHat className="h-16 w-16 text-primary relative z-10" />
        <span className="absolute -top-1 -right-1 text-3xl animate-bounce">☄️</span>
      </div>

      {/* Message Info */}
      <div className="max-w-md flex flex-col gap-3 items-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
          <FlameKindling className="h-3.5 w-3.5" />
          Recipe Overcooked
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          404 - Kitchen Error
        </h1>
        
        <p className="text-sm text-default-500 leading-relaxed">
          The chef checked all the cupboards, but the recipe you are looking for has burned in the oven or was never on the menu. Let&apos;s head back to safe ground!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
          <Link href="/" className="no-underline">
            <Button
              
              className="btn-primary w-full  text-primary-foreground font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <Compass className="h-4 w-4" />
              Return to Kitchen
            </Button>
          </Link>
          <Link href="/recipes" className="no-underline">
            <Button
              
              className="btn-secondary w-full border border-default-300 dark:border-zinc-700 text-foreground font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-default-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Recipes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
