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
  PlusCircle,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Heart,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Upload,
  Lock,
  ArrowLeft,
  ChevronRight,
  Utensils,
  Clock,
  Globe,
  Award,
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";
import { EmptyState } from "@/components/shared/EmptyState";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

// Helper Disclosure Hook for Modals
function useModalDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
}

export default function MyRecipesPage() {
  const { data: session, isPending } = authClient.useSession();

  // Data States
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit Modal States
  const editModal = useModalDisclosure(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Italian");
  const [formCuisine, setFormCuisine] = useState("International");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formPrepTime, setFormPrepTime] = useState("15 mins");
  const [formCookTime, setFormCookTime] = useState("20 mins");
  const [formImage, setFormImage] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIngredients, setFormIngredients] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Modal States
  const deleteModal = useModalDisclosure(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show Toast Auto-dismiss
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load User Recipes from backend
  useEffect(() => {
    if (!session?.user) return;

    setIsLoading(true);
    fetch(`http://127.0.0.1:5000/api/recipes?authorId=${session.user.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Map MongoDB _id to frontend id
        const fetchedRecipes = (data.recipes || []).map((r: any) => ({
          ...r,
          id: r._id,
        }));
        setRecipes(fetchedRecipes);
      })
      .catch((err) => {
        console.error("Failed to fetch recipes", err);
        setRecipes([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [session]);

  // Handle Image File Upload to ImgBB
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setFormImage(
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
        );
        showToast("Image uploaded successfully!");
      } else {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.data?.url) {
          setFormImage(data.data.url);
          showToast("Image uploaded to ImgBB successfully!");
        } else {
          showToast("Failed to upload image. Paste URL manually.", "error");
        }
      }
    } catch {
      showToast("Error uploading image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger Edit Action Modal
  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormName(recipe.title);
    setFormCategory(recipe.category || "Italian");
    setFormCuisine(recipe.cuisineType || "International");
    setFormDifficulty(recipe.difficulty || "Easy");
    setFormPrepTime(recipe.prepTime || "15 mins");
    setFormCookTime(recipe.cookTime || "20 mins");
    setFormImage(recipe.image || "");
    setFormDesc(recipe.description || "");
    setFormIngredients(recipe.ingredients ? recipe.ingredients.join("\n") : "");
    setFormInstructions(recipe.instructions ? recipe.instructions.join("\n") : "");
    editModal.open();
  };

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe || !session?.user) return;

    if (!formName || !formIngredients || !formInstructions) {
      showToast("Please complete required fields.", "error");
      return;
    }

    setIsSubmittingEdit(true);

    const updatedIngredients = formIngredients
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    const updatedInstructions = formInstructions
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const updatedList = recipes.map((r) =>
      r.id === editingRecipe.id
        ? {
            ...r,
            title: formName,
            category: formCategory,
            cuisineType: formCuisine,
            difficulty: formDifficulty,
            prepTime: formPrepTime,
            cookTime: formCookTime,
            image: formImage || r.image,
            description: formDesc,
            ingredients: updatedIngredients,
            instructions: updatedInstructions,
          }
        : r
    );

    setTimeout(() => {
      setRecipes(updatedList);
      const createdKey = `created_recipes_${session.user.id}`;
      localStorage.setItem(createdKey, JSON.stringify(updatedList));
      setIsSubmittingEdit(false);
      editModal.close();
      showToast(`Updated "${formName}" successfully!`);
    }, 600);
  };

  // Trigger Delete Confirmation Modal
  const openDeleteModal = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    deleteModal.open();
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!recipeToDelete || !session?.user) return;

    setIsDeleting(true);

    setTimeout(() => {
      const updatedList = recipes.filter((r) => r.id !== recipeToDelete.id);
      setRecipes(updatedList);
      const createdKey = `created_recipes_${session.user.id}`;
      localStorage.setItem(createdKey, JSON.stringify(updatedList));

      setIsDeleting(false);
      deleteModal.close();
      showToast(`Deleted "${recipeToDelete.title}" permanently.`, "error");
      setRecipeToDelete(null);
    }, 600);
  };

  // Filtered recipes computation
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || r.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Loading your recipes library...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">You must be logged in to manage your recipes.</p>
        <Link href="/login" className="no-underline">
          <Button  className="btn-primary  text-white font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Toast Notification Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border ambient-glow-orange flex items-center gap-3 text-xs font-bold text-white ${
              toastMessage.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-rose-600 border-rose-500"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            <span>Recipe Management Console</span>
          </h1>
        </div>

        <Link href="/dashboard/user?tab=add-recipe" className="no-underline">
          <Button
            
            className="btn-primary bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 ambient-glow-orange shadow-orange-500/20 border-none cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Recipe</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel ambient-glow-orange flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-default-400" />
          <input
            type="text"
            placeholder="Search recipes by title, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-default-400 hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-default-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 text-xs rounded-2xl bg-default-50 dark:bg-zinc-950 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Italian">Italian</option>
            <option value="Asian">Asian</option>
            <option value="Mexican">Mexican</option>
            <option value="Desserts">Desserts</option>
            <option value="Seafood">Seafood</option>
            <option value="Salads">Salads</option>
            <option value="Soups">Soups</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Recipes HeroUI Styled Data Table */}
      {filteredRecipes.length > 0 ? (
        <div className="overflow-hidden rounded-3xl glass-panel ambient-glow-orange">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
              <thead className="bg-default-50/70 dark:bg-zinc-950/80 font-bold text-default-400 uppercase tracking-wider text-left text-[10px]">
                <tr>
                  <th className="px-6 py-4">Recipe Details</th>
                  <th className="px-6 py-4">Category & Cuisine</th>
                  <th className="px-6 py-4 text-center">Likes</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-foreground">
                {filteredRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer transition-smooth"
                  >
                    {/* Column 1: Image & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-12 w-16 rounded-2xl object-cover border border-default-100 dark:border-zinc-800 shadow-sm shrink-0"
                        />
                        <div className="flex flex-col truncate max-w-[220px]">
                          <span className="font-extrabold text-foreground truncate">{recipe.title}</span>
                          <span className="text-[11px] text-default-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime || "15 mins"} prep
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Category & Cuisine */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-xs text-foreground">{recipe.category}</span>
                        <span className="text-[10px] text-default-400 flex items-center gap-1">
                          <Globe className="h-3 w-3 text-primary" />
                          {recipe.cuisineType || "International"}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Likes Count */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 font-extrabold text-xs">
                        <Heart className="h-3.5 w-3.5 fill-rose-500" />
                        <span>{recipe.likes || 0}</span>
                      </div>
                    </td>

                    {/* Column 4: Featured / Published Status Badge */}
                    <td className="px-6 py-4 text-center">
                      {recipe.isFeatured ? (
                        <Chip color="warning" variant="soft" size="sm" className="font-extrabold text-[10px]">
                          <Sparkles className="h-3 w-3 mr-1 inline" />
                          Featured
                        </Chip>
                      ) : (
                        <Chip color="success" variant="soft" size="sm" className="font-bold text-[10px]">
                          Published
                        </Chip>
                      )}
                    </td>

                    {/* Column 5: Action Controls */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-zinc-800 transition-smooth"
                          title="View Recipe"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Edit Action Button */}
                        <button
                          onClick={() => openEditModal(recipe)}
                          className="p-2 rounded-xl border border-default-200 dark:border-zinc-800 text-default-500 hover:text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                          title="Edit Recipe"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {/* Delete Action Button */}
                        <button
                          onClick={() => openDeleteModal(recipe)}
                          className="p-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-smooth cursor-pointer"
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
      ) : (
        <EmptyState
          icon={Utensils}
          variant="primary"
          title={searchTerm || selectedCategory !== "All" ? "No Matching Recipes" : "No Recipes Found"}
          description={
            searchTerm || selectedCategory !== "All"
              ? "No published recipes matched your search query or category filter. Try clearing your search filters."
              : "You haven't created any recipes yet. Share your culinary expertise with our global foodie community!"
          }
          actionLabel="Create Your First Recipe"
          actionLink="/dashboard/user?tab=add-recipe"
        />
      )}

      {/* 2. EDIT / UPDATE RECIPE HEROUI MODAL */}
      <AnimatePresence>
        {editModal.isOpen && editingRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={editModal.close}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange flex flex-col gap-6 z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-default-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-foreground">Edit Recipe Details</h3>
                    <span className="text-xs text-default-400">Update culinary instructions & metadata</span>
                  </div>
                </div>
                <button
                  onClick={editModal.close}
                  className="p-1.5 rounded-full hover:bg-default-100 dark:hover:bg-zinc-900 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">
                    Recipe Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-semibold outline-none focus:border-primary"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[70px]"
                  />
                </div>

                {/* Form Grid Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-medium outline-none focus:border-primary h-10"
                    >
                      {["Italian", "Asian", "Mexican", "Desserts", "Seafood", "Salads", "Soups", "Other"].map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Cuisine Type</label>
                    <input
                      type="text"
                      value={formCuisine}
                      onChange={(e) => setFormCuisine(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Difficulty</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground font-medium outline-none focus:border-primary h-10"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Prep and Cook Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Prep Time</label>
                    <input
                      type="text"
                      value={formPrepTime}
                      onChange={(e) => setFormPrepTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-500">Cook Time</label>
                    <input
                      type="text"
                      value={formCookTime}
                      onChange={(e) => setFormCookTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">Recipe Image File / URL</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-default-200 dark:border-zinc-800 rounded-xl cursor-pointer bg-default-50 hover:bg-default-100 text-xs font-semibold text-foreground">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4" />}
                      <span>Upload ImgBB</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isUploading} />
                    </label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Or paste URL..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Dynamic Ingredients Array */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">
                    Ingredients (One item per line) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[90px]"
                    required
                  />
                </div>

                {/* Dynamic Instructions Array */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-default-500">
                    Instructions (One step per line) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 text-foreground outline-none focus:border-primary min-h-[90px]"
                    required
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 justify-end border-t border-default-100 dark:border-zinc-800 pt-4 mt-2">
                  <Button
                    type="button"
                    
                    onClick={editModal.close}
                    isDisabled={isSubmittingEdit}
                    className="btn-secondary font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    
                    isDisabled={isSubmittingEdit}
                    className="btn-primary  hover:/90 text-white font-bold text-xs rounded-xl px-5 py-2 shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. DESTRUCTIVE DELETE CONFIRMATION HEROUI MODAL */}
      <AnimatePresence>
        {deleteModal.isOpen && recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={deleteModal.close}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 rounded-3xl glass-panel border-rose-500/30 ambient-glow-orange flex flex-col gap-5 z-10"
            >
              {/* Warning Header */}
              <div className="flex items-center gap-3 border-b border-default-100 dark:border-zinc-800 pb-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                    Confirm Recipe Deletion
                  </h3>
                  <span className="text-xs text-default-400">This action cannot be undone</span>
                </div>
              </div>

              {/* Recipe Target Snapshot */}
              <div className="p-3 rounded-2xl bg-default-50 dark:bg-zinc-900 border border-default-100 dark:border-zinc-800 flex items-center gap-3">
                <img
                  src={recipeToDelete.image}
                  alt={recipeToDelete.title}
                  className="h-12 w-16 rounded-xl object-cover border"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-foreground">{recipeToDelete.title}</span>
                  <span className="text-[10px] text-default-400">{recipeToDelete.category}</span>
                </div>
              </div>

              <p className="text-xs text-default-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-foreground">&ldquo;{recipeToDelete.title}&rdquo;</strong> from your recipe collection? All likes and saved bookmarks for this dish will be removed.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  
                  onClick={deleteModal.close}
                  isDisabled={isDeleting}
                  className="btn-secondary font-semibold text-xs rounded-xl px-4 py-2 border border-default-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  
                  onClick={handleConfirmDelete}
                  isDisabled={isDeleting}
                  className="btn-primary bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center gap-1.5 shadow-md shadow-rose-600/20 border-none cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Recipe</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
