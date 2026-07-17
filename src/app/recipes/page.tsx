import React from "react";
import { Link, Button } from "@heroui/react";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { ChevronLeft, ChevronRight, Compass, Sparkles, Plus } from "lucide-react";

interface RecipesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

const CATEGORIES = [
  "All",
  "Italian",
  "Asian",
  "Mexican",
  "Desserts",
  "Seafood",
  "Salads",
  "Soups",
];

const PAGE_SIZE = 6;

export default async function RecipesPage(props: RecipesPageProps) {
  // Await searchParams in Next.js 16
  const { category, page } = await props.searchParams;

  const currentCategory = category || "All";
  const currentPage = Number(page || "1");

  // Filter recipes based on category query
  const filteredRecipes =
    currentCategory === "All"
      ? mockRecipes
      : mockRecipes.filter(
          (r) => r.category.toLowerCase() === currentCategory.toLowerCase()
        );

  const totalRecipes = filteredRecipes.length;
  const totalPages = Math.ceil(totalRecipes / PAGE_SIZE) || 1;
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);

  // Paginated list slice
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

  // Helper to build query links
  const getFilterLink = (catName: string, pageNum: number = 1) => {
    const params = new URLSearchParams();
    if (catName !== "All") params.set("category", catName);
    if (pageNum > 1) params.set("page", String(pageNum));
    
    const queryStr = params.toString();
    return `/recipes${queryStr ? `?${queryStr}` : ""}`;
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
            <Compass className="h-4 w-4" />
            <span>Culinary Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Explore All Recipes
          </h1>
          <p className="text-sm text-default-500">
            Showing {totalRecipes} delicious recipes matching your criteria
          </p>
        </div>
        <Link href="/dashboard/add-recipe" className="no-underline">
          <Button
            variant="primary"
            size="sm"
            className="font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Share Recipe
          </Button>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Category Filters: Sidebar (Desktop) / Horizontal Bar (Mobile) */}
        <aside className="w-full lg:w-64 flex flex-col gap-4 shrink-0 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-2 border-b border-default-100 dark:border-zinc-800 lg:block lg:border-none">
            <span className="font-bold text-sm uppercase tracking-wider text-default-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Categories
            </span>
          </div>

          {/* Sidebar container: Scrollable row on mobile, vertical list on desktop */}
          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none w-full shrink-0">
            {CATEGORIES.map((cat) => {
              const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  href={getFilterLink(cat)}
                  className={`text-sm px-4 py-2 rounded-xl transition-all font-medium border border-transparent whitespace-nowrap justify-start hover:bg-default-50 dark:hover:bg-zinc-800/50 ${
                    isSelected
                      ? "bg-primary/10 text-primary border-primary/20 font-bold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Recipes Grid & Pagination */}
        <div className="flex-grow w-full flex flex-col gap-10">
          {paginatedRecipes.length > 0 ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="w-full text-center py-20 bg-default-50 dark:bg-zinc-900/40 border border-dashed border-default-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-4 p-8">
              <span className="text-4xl">🍳</span>
              <h3 className="text-lg font-bold text-foreground">No Recipes Found</h3>
              <p className="text-sm text-default-500 max-w-sm">
                We couldn&apos;t find any recipes in the &ldquo;{currentCategory}&rdquo; category. Try checking another category or contribute one of your own!
              </p>
              <Link href={getFilterLink("All")}>
                <Button variant="outline" size="sm" className="font-semibold border border-default-300 dark:border-zinc-700">
                  Reset Category
                </Button>
              </Link>
            </div>
          )}

          {/* Server-Side Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 border-t border-default-100 dark:border-zinc-800/80 pt-6 mt-4">
              {/* Previous Page Link */}
              <Link
                href={getFilterLink(currentCategory, activePage - 1)}
                className={`p-2 border border-default-200 dark:border-zinc-700 rounded-lg text-default-600 transition-colors ${
                  activePage <= 1
                    ? "pointer-events-none opacity-40 bg-default-100"
                    : "hover:bg-default-50 dark:hover:bg-zinc-800"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              {/* Page Number Links */}
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === activePage;
                  return (
                    <Link
                      key={pNum}
                      href={getFilterLink(currentCategory, pNum)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all ${
                        isCurrent
                          ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                          : "border-default-200 dark:border-zinc-700 text-default-600 hover:bg-default-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}
              </div>

              {/* Next Page Link */}
              <Link
                href={getFilterLink(currentCategory, activePage + 1)}
                className={`p-2 border border-default-200 dark:border-zinc-700 rounded-lg text-default-600 transition-colors ${
                  activePage >= totalPages
                    ? "pointer-events-none opacity-40 bg-default-100"
                    : "hover:bg-default-50 dark:hover:bg-zinc-800"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
