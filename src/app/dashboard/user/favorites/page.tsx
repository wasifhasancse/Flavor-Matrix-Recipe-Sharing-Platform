"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Star, Eye, BookOpen, Loader2 } from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";
import { EmptyState } from "@/components/shared/EmptyState";

export default function FavoritesPage() {
  const { data: session, isPending } = authClient.useSession();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      // Setup mock favorites
      const favKey = `favorites_${session.user.id}`;
      const stored = localStorage.getItem(favKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        const initialFavs = mockRecipes.slice(3, 5);
        setFavorites(initialFavs);
        localStorage.setItem(favKey, JSON.stringify(initialFavs));
      }
    }
    setIsLoading(false);
  }, [session]);

  const handleUnfavorite = (recipeId: string) => {
    if (!session?.user) return;
    const updated = favorites.filter((r) => r.id !== recipeId);
    setFavorites(updated);
    localStorage.setItem(`favorites_${session.user.id}`, JSON.stringify(updated));
  };

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Star className="h-7 w-7 text-primary" />
            <span>My Favorited Bookmarks</span>
          </h1>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl glass-panel ambient-glow-orange w-full">
          <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
            <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
              <tr>
                <th className="px-6 py-4">Recipe</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
              {favorites.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={recipe.image}
                      alt=""
                      className="h-10 w-14 rounded-xl object-cover border border-default-100 dark:border-zinc-800"
                    />
                    <span className="font-bold text-foreground truncate max-w-[180px]">
                      {recipe.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">{recipe.category}</td>
                  <td className="px-6 py-4 text-default-400">{recipe.author}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground hover:bg-default-50 transition-smooth"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleUnfavorite(recipe.id)}
                        className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-500/5 transition-smooth cursor-pointer"
                        title="Unfavorite item"
                      >
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Star}
          variant="amber"
          title="No Favorited Recipes"
          description="Recipes you bookmark as favorites will show up here. Go explore some delicious dishes!"
          actionLabel="Explore Dishes"
          actionLink="/recipes"
        />
      )}
    </div>
  );
}
