import React, { Suspense } from "react";
import { Link, Button, Spinner } from "@heroui/react";
import { RecipeCard } from "@/components/RecipeCard";
import { Compass, Sparkles, Plus, SearchX } from "lucide-react";
import { SearchControls } from "./SearchControls";
import { RecipePagination } from "./RecipePagination";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

interface RecipesPageProps {
  searchParams: Promise<{
    category?: string;
    difficultyLevel?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    search?: string;
  }>;
}

export const dynamic = 'force-dynamic';

async function fetchRecipes(params: Record<string, string | undefined>) {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "All") urlParams.set(key, value);
  });
  
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:5000";
  const res = await fetch(`${baseUrl}/api/recipes?${urlParams.toString()}`, {
    cache: "no-store",
  });
  
  if (!res.ok) {
    // If there's an error (e.g. database connection failed or empty database causing 500),
    // gracefully return an empty result so the UI shows the "No Recipes Found" message
    console.error("Failed to fetch recipes, returning empty data.");
    return { recipes: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } };
  }
  
  return res.json();
}

export default async function RecipesPage(props: RecipesPageProps) {
  const searchParams = await props.searchParams;

  const data = await fetchRecipes(searchParams);
  const recipes = data.recipes.map((r: any) => ({ ...r, id: r._id }));
  const totalRecipes = data.pagination?.total || 0;
  const totalPages = data.pagination?.totalPages || 1;
  const activePage = data.pagination?.page || 1;

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <DynamicBreadcrumb />
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mt-1">
            <Compass className="h-4 w-4" />
            <span>Culinary Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Explore All Recipes
          </h1>
          <p className="text-sm text-default-500">
            {totalRecipes > 0 
              ? `Showing ${(activePage - 1) * 6 + 1}-${Math.min(activePage * 6, totalRecipes)} of ${totalRecipes} delicious recipes matching your criteria`
              : "No recipes found matching your criteria"}
          </p>
        </div>
        <Link href="/dashboard/user/add-recipe" className="no-underline">
          <Button
            size="sm"
            className="btn-primary rounded-lg px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Share Recipe
          </Button>
        </Link>
      </div>

      <Suspense fallback={<Spinner className="mx-auto mt-10" />}>
        <SearchControls />
      </Suspense>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-8">
        {/* Recipes Grid & Pagination */}
        <div className="flex-grow w-full flex flex-col gap-10">
          {recipes.length > 0 ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {recipes.map((recipe: any) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="w-full text-center py-20 bg-default-50 dark:bg-zinc-900/40 border border-dashed border-default-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-4 p-8">
              <div className="bg-default-100 p-4 rounded-full text-default-400">
                <SearchX className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Recipes Found</h3>
              <p className="text-sm text-default-500 max-w-sm">
                We couldn&apos;t find any recipes matching your current filters. Try checking another category, reducing the difficulty level, or clearing all filters to explore.
              </p>
              <Link href="/recipes">
                <Button  size="sm" className="btn-secondary font-semibold mt-2">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          )}

          {/* Server-Side Pagination Controls */}
          {totalPages > 1 && (
            <Suspense fallback={null}>
              <RecipePagination total={totalPages} initialPage={activePage} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
