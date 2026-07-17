"use client";

import React, { useState } from "react";
import { Recipe } from "@/data/recipes";
import { Link } from "@heroui/react";
import { Heart, Clock, ChefHat, User, ArrowRight } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [likesCount, setLikesCount] = useState(recipe.likes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
    } else {
      setLikesCount((prev) => prev + 1);
    }
    setHasLiked(!hasLiked);
  };

  const getDifficultyColor = (difficulty: Recipe["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/10 text-success dark:bg-success/20";
      case "Medium":
        return "bg-warning/10 text-warning dark:bg-warning/20";
      case "Hard":
        return "bg-danger/10 text-danger dark:bg-danger/20";
      default:
        return "bg-default-100 text-default-600";
    }
  };

  return (
    <div className="group flex flex-col w-full rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-default-100 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Recipe Image & Category Tag */}
      <div className="relative aspect-video w-full overflow-hidden bg-default-100">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm tracking-wide">
          {recipe.category}
        </span>
        {/* Like Button overlay */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-default-600 hover:text-danger hover:scale-110 shadow-sm transition-all"
          aria-label={hasLiked ? "Unlike recipe" : "Like recipe"}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${hasLiked ? "fill-danger text-danger" : "text-default-500"}`} />
        </button>
      </div>

      {/* Recipe Info */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-xs text-default-500 line-clamp-2 min-h-[2rem]">
            {recipe.description}
          </p>
        </div>

        {/* Info Tags */}
        <div className="flex items-center gap-3 text-xs text-default-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-default-400" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5 text-default-400" />
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <hr className="border-default-100 dark:border-zinc-800/80 my-1" />

        <div className="flex justify-between items-center text-xs mt-auto">
          <div className="flex items-center gap-1.5 text-default-500">
            <User className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{recipe.author}</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-default-700 dark:text-default-300">
            <Heart className="h-3.5 w-3.5 text-danger fill-danger" />
            {likesCount}
          </span>
        </div>

        {/* View Details Button */}
        <Link
          href={`/recipes/${recipe.id}`}
          className="mt-3 font-semibold text-xs text-primary border border-primary/20 dark:border-zinc-800 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-lg py-2 flex items-center justify-center gap-1.5"
        >
          View Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
