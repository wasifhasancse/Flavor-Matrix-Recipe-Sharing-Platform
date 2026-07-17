import React from "react";
import { Loader2, ChefHat } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] bg-background text-foreground transition-colors p-4">
      <div className="relative flex items-center justify-center">
        {/* Outer spinner */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        
        {/* Inner chef hat icon pulsing */}
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 animate-pulse">
          <ChefHat className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
        <h3 className="font-bold text-sm tracking-wide text-foreground">
          Flavor Matrix is Loading
        </h3>
        <p className="text-xs text-default-400">
          Gathering ingredients and preparing your digital kitchen...
        </p>
      </div>
    </div>
  );
}
