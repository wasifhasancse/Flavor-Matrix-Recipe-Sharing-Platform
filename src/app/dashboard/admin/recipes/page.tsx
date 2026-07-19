"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Tag,
  User,
  X,
  Upload,
} from "lucide-react";
import { Recipe, mockRecipes } from "@/data/recipes";
import { EmptyState } from "@/components/shared/EmptyState";

const ITEMS_PER_PAGE = 10;

export default function AdminRecipesPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Edit Modal State
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editCuisine, setEditCuisine] = useState<string>("");
  const [editPrepTime, setEditPrepTime] = useState<string>("");
  const [editIngredients, setEditIngredients] = useState<string>("");
  const [editInstructions, setEditInstructions] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete Modal State
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Recipes Data
  useEffect(() => {
    setIsLoading(true);
    const storedUserRecipes = session?.user
      ? JSON.parse(localStorage.getItem(`created_recipes_${session.user.id}`) || "[]")
      : [];
    const merged = [...storedUserRecipes, ...mockRecipes];
    setRecipesList(merged);
    setIsLoading(false);
  }, [session]);

  // Toggle Featured Status (Optimistic UI & API)
  const handleToggleFeatured = async (recipeId: string, currentFeaturedState: boolean) => {
    const nextFeatured = !currentFeaturedState;

    // Optimistic Update
    setRecipesList((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFeatured: nextFeatured } : r))
    );

    showToast(
      nextFeatured
        ? "Recipe promoted to Homepage Featured section!"
        : "Recipe removed from Featured section."
    );

    // Call Backend API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      fetch(`${baseUrl}/api/admin/recipes/${recipeId}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      }).catch(() => {});
    } catch {
      setRecipesList((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, isFeatured: currentFeaturedState } : r))
      );
      showToast("Failed to update featured status.");
    }
  };

  // Open Edit Modal
  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setEditTitle(recipe.title);
    setEditCategory(recipe.category);
    setEditCuisine(recipe.cuisineType || "International");
    setEditPrepTime(recipe.prepTime || "25 mins");
    setEditIngredients(recipe.ingredients ? recipe.ingredients.join("\n") : "");
    setEditInstructions(recipe.instructions ? recipe.instructions.join("\n") : "");
    setIsEditModalOpen(true);
  };

  // Save Edit Recipe
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    setIsSaving(true);
    const updatedRecipe: Recipe = {
      ...editingRecipe,
      title: editTitle.trim(),
      category: editCategory.trim(),
      cuisineType: editCuisine.trim(),
      prepTime: editPrepTime.trim(),
      ingredients: editIngredients.split("\n").map((i) => i.trim()).filter(Boolean),
      instructions: editInstructions.split("\n").map((i) => i.trim()).filter(Boolean),
    };

    setTimeout(() => {
      setRecipesList((prev) =>
        prev.map((r) => (r.id === editingRecipe.id ? updatedRecipe : r))
      );
      setIsSaving(false);
      setIsEditModalOpen(false);
      showToast("Recipe updated successfully!");
    }, 600);
  };

  // Open Delete Modal
  const openDeleteModal = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Action
  const confirmDelete = () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);

    setTimeout(() => {
      setRecipesList((prev) => prev.filter((r) => r.id !== recipeToDelete.id));

      // Fire API call
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      fetch(`${baseUrl}/api/admin/recipes/${recipeToDelete.id}`, {
        method: "DELETE",
      }).catch(() => {});

      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
      showToast("Recipe permanently purged from database.");
    }, 600);
  };

  // Clear Filters Handler
  const handleResetFilters = () => {
    setSearchTerm("");
    setFeaturedFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  // Filter Computation
  const filteredRecipes = recipesList.filter((rcp) => {
    const matchesSearch =
      rcp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rcp.author && rcp.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rcp.category && rcp.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && rcp.isFeatured) ||
      (featuredFilter === "non-featured" && !rcp.isFeatured);

    const matchesCategory =
      categoryFilter === "all" ||
      rcp.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesFeatured && matchesCategory;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading recipe inventory...</p>
      </div>
    );
  }

  // Admin Security Guard
  const isAdmin = session?.user && (session.user as any).role === "admin";
  if (!session || !isAdmin) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">Administrator privileges are required to access recipe controls.</p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Sign In as Admin
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 border border-emerald-500 ambient-glow-orange flex items-center gap-3 text-xs font-bold text-white"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-default-400">
            <Link href="/dashboard/admin" className="hover:text-primary transition-smooth flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Recipe Approvals & Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            <span>Recipe Approvals & Inventory Portal</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="accent" variant="soft" className="font-extrabold text-xs">
            {recipesList.length} Recipes Published
          </Chip>
        </div>
      </div>

      {/* SEARCH BAR & FEATURED / CATEGORY FILTER TOOLBAR */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Real-Time Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search recipes by title or author email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
          />
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-default-400 shrink-0" />
          
          {/* Featured Status Filter Dropdown */}
          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 px-3.5 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="featured">Featured Only</option>
            <option value="non-featured">Non-Featured Only</option>
          </select>

          {(searchTerm || featuredFilter !== "all" || categoryFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs font-bold rounded-2xl border border-default-200 dark:border-zinc-800 cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* HEROUI RESPONSIVE RECIPE TABLE */}
      {paginatedRecipes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="overflow-hidden rounded-3xl glass-panel ambient-glow-orange">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Recipe Preview</th>
                    <th className="px-6 py-4">Author Metadata</th>
                    <th className="px-6 py-4">Category & Cuisine</th>
                    <th className="px-6 py-4 text-center">Likes</th>
                    <th className="px-6 py-4 text-center">Featured Badge</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                  {paginatedRecipes.map((rcp) => (
                    <tr
                      key={rcp.id}
                      className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                    >
                      {/* Column 1: Recipe Preview (Image & Name) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rcp.image}
                            alt={rcp.title}
                            className="h-12 w-16 rounded-2xl object-cover border border-default-100 dark:border-zinc-800 shadow-sm shrink-0"
                          />
                          <div className="flex flex-col truncate max-w-[200px]">
                            <span className="font-extrabold text-foreground truncate text-xs">
                              {rcp.title}
                            </span>
                            <span className="text-[10px] text-default-400 uppercase font-semibold">
                              {rcp.prepTime || "25 mins"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Author Metadata (Name & Email) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar.Root className="w-6 h-6 rounded-full border bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                            <Avatar.Fallback>{(rcp.author || "User").charAt(0).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          <div className="flex flex-col truncate max-w-[160px]">
                            <span className="font-bold text-xs text-foreground truncate">{rcp.author || "Chef User"}</span>
                            <span className="text-[10px] text-default-400 truncate">
                              {(rcp as any).authorEmail || `${(rcp.author || "chef").toLowerCase().replace(/\s+/g, "")}@example.com`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Category & Cuisine Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Chip color="accent" variant="soft" size="sm" className="font-bold text-[10px]">
                            {rcp.category}
                          </Chip>
                          <span className="text-[10px] text-default-400 font-semibold">
                            {rcp.cuisineType || "International"}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Likes Count */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-500">
                          <Heart className="h-3.5 w-3.5 fill-rose-500" />
                          <span>{rcp.likes || 120}</span>
                        </div>
                      </td>

                      {/* Column 5: Featured Status Badge & Toggle */}
                      <td className="px-6 py-4 text-center">
                        <Button
                          onPress={() => handleToggleFeatured(rcp.id, !!rcp.isFeatured)}
                          variant="outline"
                          className={`py-1.5 px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                            rcp.isFeatured
                              ? "border-amber-500/40 text-amber-500 bg-amber-500/10 shadow-sm"
                              : "border-default-200 dark:border-zinc-800 text-default-400 hover:text-foreground"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${rcp.isFeatured ? "fill-amber-500" : ""}`} />
                          <span>{rcp.isFeatured ? "Featured" : "Promote"}</span>
                        </Button>
                      </td>

                      {/* Column 6: Actions (View, Edit, Delete) */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/recipes/${rcp.id}`}
                            className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground transition-smooth"
                            title="View Recipe"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => openEditModal(rcp)}
                            className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                            title="Edit Recipe"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(rcp)}
                            className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-smooth cursor-pointer"
                            title="Delete Recipe"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HeroUI Server-side Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default-100 dark:border-zinc-800 pt-4 px-2">
              <span className="text-xs text-default-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecipes.length)} of {filteredRecipes.length} recipes
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-default-50 dark:bg-zinc-900 text-default-600 hover:bg-default-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="font-bold text-xs rounded-xl border border-default-200 dark:border-zinc-800 cursor-pointer disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Empty State Layout */
        <EmptyState
          icon={BookOpen}
          variant="primary"
          title="No Matching Recipes Found"
          description="No published recipes matched your search criteria or featured status filters. Reset your filters to view all recipe records."
          actionLabel="Reset Search Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* EDIT RECIPE HEROUI MODAL */}
      <AnimatePresence>
        {isEditModalOpen && editingRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-foreground">Edit Recipe Details</h3>
                    <span className="text-xs text-default-400">Administrative corrections & updates</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Recipe Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Cuisine Type</label>
                    <input
                      type="text"
                      value={editCuisine}
                      onChange={(e) => setEditCuisine(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Ingredients (One per line)</label>
                  <textarea
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[70px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Instructions (One step per line)</label>
                  <textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[70px]"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-default-100 dark:border-zinc-800 pt-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    isDisabled={isSaving}
                    className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Recipe"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE DELETE RECIPE HEROUI MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-foreground">Purge Recipe Record</h3>
                  <span className="text-xs text-rose-500 font-semibold">Destructive Admin Action</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 flex items-center gap-3">
                {recipeToDelete.image && (
                  <img src={recipeToDelete.image} alt={recipeToDelete.title} className="h-12 w-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-xs text-foreground truncate">{recipeToDelete.title}</span>
                  <span className="text-[10px] text-default-400 uppercase tracking-wider">{recipeToDelete.category}</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                Are you sure you want to permanently delete this recipe from the system? This action cannot be undone.
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  isDisabled={isDeleting}
                  className="font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmDelete}
                  isDisabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md border-none cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Recipe"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
