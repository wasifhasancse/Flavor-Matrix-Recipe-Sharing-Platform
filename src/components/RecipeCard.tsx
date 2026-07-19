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
    <div className="group flex flex-col w-full rounded-3xl bg-white dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Recipe Image & Category Tag */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-default-100">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md tracking-wide">
          {recipe.category}
        </span>
        {/* Like Button overlay */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-default-700 hover:text-danger hover:scale-110 shadow-sm transition-all"
          aria-label={hasLiked ? "Unlike recipe" : "Like recipe"}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${hasLiked ? "fill-danger text-danger" : "text-default-700 dark:text-default-300"}`} />
        </button>
      </div>

      {/* Recipe Info */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-[1.15rem] leading-tight font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-sm text-default-500 line-clamp-2 min-h-[2.5rem]">
            {recipe.description}
          </p>
        </div>

        {/* Info Tags */}
        <div className="flex items-center gap-4 text-sm text-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4" />
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <hr className="border-default-200 dark:border-zinc-800 my-1" />

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4" />
            <span className="truncate max-w-[120px]">{recipe.author}</span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Heart className="h-4 w-4 text-danger fill-danger" />
            {likesCount}
          </span>
        </div>

        {/* View Details Button */}
        <Link
          href={`/recipes/${recipe.id}`}
          className="mt-2 w-fit text-sm font-semibold text-foreground border border-default-200 dark:border-zinc-700 hover:bg-default-100 dark:hover:bg-zinc-800 transition-all rounded-[10px] px-3.5 py-2 flex items-center justify-center gap-1.5"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
