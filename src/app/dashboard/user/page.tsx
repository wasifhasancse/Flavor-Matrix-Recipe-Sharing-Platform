"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, Label, Input, Button, Link } from "@heroui/react";
import {
  LayoutDashboard,
  BookOpen,
  Star,
  ShoppingBag,
  PlusCircle,
  Sparkles,
  Heart,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Lock,
  Upload,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  ArrowRight
} from "lucide-react";
import { mockRecipes, Recipe } from "@/data/recipes";

type TabType = "overview" | "add-recipe" | "my-recipes" | "favorites" | "purchased";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "overview";

  const { data: session, isPending } = authClient.useSession();
  
  // States
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Recipes Storage States
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [purchased, setPurchased] = useState<Recipe[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  
  // Add/Edit Form States
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Italian");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formPrep, setFormPrep] = useState("10 mins");
  const [formCook, setFormCook] = useState("15 mins");
  const [formIngredients, setFormIngredients] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setFormError(null);
    setFormSuccess(false);
    // Reset edit state if leaving form
    if (tab !== "add-recipe") {
      resetForm();
    }
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.push(`/dashboard/user?${params.toString()}`);
  };

  // Load user data from localStorage
  useEffect(() => {
    if (!session?.user) return;

    // Load created recipes
    const createdKey = `created_recipes_${session.user.id}`;
    const storedCreated = localStorage.getItem(createdKey);
    if (storedCreated) {
      setMyRecipes(JSON.parse(storedCreated));
    }

    // Load premium membership simulation state
    const premiumKey = `is_premium_account_${session.user.id}`;
    const storedPremium = localStorage.getItem(premiumKey) === "true";
    
    // Check if they have purchased at least one recipe, that also qualifies for premium tier preview
    let hasPurchasedRecipe = false;
    mockRecipes.forEach((r) => {
      if (localStorage.getItem(`purchased_${r.id}`) === "true") {
        hasPurchasedRecipe = true;
      }
    });

    setIsPremiumUser(storedPremium || hasPurchasedRecipe);

    // Load purchased recipes
    const purchasedList = mockRecipes.filter(
      (r) => localStorage.getItem(`purchased_${r.id}`) === "true"
    );
    setPurchased(purchasedList);

    // Simulate favorites (load from localStorage or seed with default)
    const favKey = `favorites_list_${session.user.id}`;
    const storedFav = localStorage.getItem(favKey);
    if (storedFav) {
      setFavorites(JSON.parse(storedFav));
    } else {
      // Seed first 2 mock recipes as favorites for beautiful display on load
      const initialFavs = mockRecipes.slice(0, 2);
      localStorage.setItem(favKey, JSON.stringify(initialFavs));
      setFavorites(initialFavs);
    }
  }, [session]);

  // Simulate Premium upgrade toggle
  const togglePremiumMembership = () => {
    if (!session?.user) return;
    const premiumKey = `is_premium_account_${session.user.id}`;
    const nextState = !isPremiumUser;
    localStorage.setItem(premiumKey, String(nextState));
    setIsPremiumUser(nextState);
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        // Simulated upload fallback
        console.warn("NEXT_PUBLIC_IMGBB_API_KEY is not defined. Simulating ImgBB upload...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Set a random food image from unsplash
        setUploadedImageUrl(
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
        );
      } else {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.data?.url) {
          setUploadedImageUrl(data.data.url);
        } else {
          setFormError("ImgBB upload failed. Please try again or paste image URL.");
        }
      }
    } catch (err) {
      setFormError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Add / Edit Recipe Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setFormError(null);

    // Enforce recipe limit for free users (only on new creations)
    if (!editingRecipeId && !isPremiumUser && myRecipes.length >= 2) {
      setFormError(
        "You have reached the creation limit of 2 recipes for free tiers. Upgrade to Premium to add unlimited recipes!"
      );
      return;
    }

    if (!formTitle || !formDesc || !formIngredients || !formInstructions) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const ingredientsArray = formIngredients
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    const instructionsArray = formInstructions
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (ingredientsArray.length === 0 || instructionsArray.length === 0) {
      setFormError("Please enter at least one ingredient and instruction.");
      return;
    }

    const defaultImage = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

    const createdKey = `created_recipes_${session.user.id}`;
    let updatedRecipes = [...myRecipes];

    if (editingRecipeId) {
      // Edit Mode
      updatedRecipes = updatedRecipes.map((r) =>
        r.id === editingRecipeId
          ? {
              ...r,
              title: formTitle,
              description: formDesc,
              category: formCategory,
              difficulty: formDifficulty,
              prepTime: formPrep,
              cookTime: formCook,
              ingredients: ingredientsArray,
              instructions: instructionsArray,
              image: uploadedImageUrl || r.image,
            }
          : r
      );
      setFormSuccess(true);
      setTimeout(() => {
        setMyRecipes(updatedRecipes);
        localStorage.setItem(createdKey, JSON.stringify(updatedRecipes));
        handleTabChange("my-recipes");
      }, 1000);
    } else {
      // Add Mode
      const newRecipe: Recipe = {
        id: `user-rec-${Date.now()}`,
        title: formTitle,
        description: formDesc,
        category: formCategory,
        difficulty: formDifficulty,
        prepTime: formPrep,
        cookTime: formCook,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        image: uploadedImageUrl || defaultImage,
        likes: 0,
        isFeatured: false,
        author: session.user.name || "Home Chef",
      };

      const finalRecipes = [newRecipe, ...updatedRecipes];
      setMyRecipes(finalRecipes);
      localStorage.setItem(createdKey, JSON.stringify(finalRecipes));
      setFormSuccess(true);
      setTimeout(() => {
        handleTabChange("my-recipes");
      }, 1000);
    }
  };

  const handleEditClick = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setFormTitle(recipe.title);
    setFormDesc(recipe.description);
    setFormCategory(recipe.category);
    setFormDifficulty(recipe.difficulty);
    setFormPrep(recipe.prepTime);
    setFormCook(recipe.cookTime);
    setFormIngredients(recipe.ingredients.join("\n"));
    setFormInstructions(recipe.instructions.join("\n"));
    setUploadedImageUrl(recipe.image);
    setActiveTab("add-recipe");
  };

  const handleDeleteRecipe = (id: string) => {
    if (!session?.user) return;
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    const createdKey = `created_recipes_${session.user.id}`;
    const updated = myRecipes.filter((r) => r.id !== id);
    setMyRecipes(updated);
    localStorage.setItem(createdKey, JSON.stringify(updated));
  };

  const handleUnfavorite = (id: string) => {
    if (!session?.user) return;
    const favKey = `favorites_list_${session.user.id}`;
    const updated = favorites.filter((r) => r.id !== id);
    setFavorites(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));
  };

  const resetForm = () => {
    setEditingRecipeId(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Italian");
    setFormDifficulty("Easy");
    setFormPrep("10 mins");
    setFormCook("15 mins");
    setFormIngredients("");
    setFormInstructions("");
    setUploadedImageUrl("");
    setFormError(null);
    setFormSuccess(false);
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-default-500 font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-grow max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-5">
        <Lock className="h-16 w-16 text-warning" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-default-500">
          You must be logged in to view your dashboard profile.
        </p>
        <Link href="/login" className="no-underline">
          <Button variant="primary" className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg shadow-md">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Count likes across user's own recipes
  const totalLikes = myRecipes.reduce((acc, r) => acc + r.likes, 0);

  return (
    <div className="flex-grow flex flex-col lg:flex-row bg-background">
      
      {/* Sidebar Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-default-50 dark:bg-zinc-900/60 border-b border-default-100 dark:border-zinc-800">
        <span className="font-bold text-sm text-foreground">User Dashboard</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-default-500 hover:text-foreground"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full lg:w-64 bg-default-50/50 dark:bg-zinc-900/20 border-r border-default-100 dark:border-zinc-800 flex flex-col gap-6 p-6 shrink-0 lg:block ${
          isSidebarOpen ? "block absolute inset-x-0 z-40 bg-background h-full" : "hidden"
        }`}
      >
        {/* User Card */}
        <div className="flex flex-col gap-3 pb-6 border-b border-default-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-primary/30">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="h-full w-full object-cover rounded-full" />
              ) : (
                session.user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-foreground truncate">{session.user.name}</span>
              <span className="text-[11px] text-default-400 truncate">{session.user.email}</span>
            </div>
          </div>

          {/* Golden Premium Badge */}
          {isPremiumUser ? (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm animate-pulse">
              <Sparkles className="h-3 w-3" />
              PREMIUM CHEF
            </div>
          ) : (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-default-200 text-default-600 dark:bg-zinc-800 dark:text-default-400 border border-default-300 dark:border-zinc-700">
              FREE MEMBERSHIP
            </div>
          )}
        </div>

        {/* Navigation Options */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {[
            { label: "Overview", icon: LayoutDashboard, tab: "overview" },
            { label: "My Recipes", icon: BookOpen, tab: "my-recipes" },
            { label: "Favorites", icon: Star, tab: "favorites" },
            { label: "Purchased", icon: ShoppingBag, tab: "purchased" },
            { label: "Add Recipe", icon: PlusCircle, tab: "add-recipe" }
          ].map((item) => {
            const isSelected = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                    : "text-default-600 hover:bg-default-50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 max-w-5xl w-full mx-auto">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview Console</h2>
              
              {/* Premium toggle shortcut uploader */}
              <Button
                onPress={togglePremiumMembership}
                className={`font-semibold text-xs py-2 px-4 rounded-lg border transition-all ${
                  isPremiumUser
                    ? "bg-default-100 border-default-200 text-default-700 hover:bg-default-200"
                    : "bg-amber-500 border-amber-600 text-black hover:bg-amber-400 font-bold hover:shadow-lg shadow-amber-500/10"
                }`}
              >
                {isPremiumUser ? "Switch to Free Account" : "Activate Premium Simulator"}
              </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: "My Shared Recipes", count: myRecipes.length, label: "Recipes created", icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20" },
                { title: "My Favorited Items", count: favorites.length, label: "Starred bookmarks", icon: Star, color: "text-warning bg-warning/10 border-warning/20" },
                { title: "Total Recipe Likes", count: totalLikes, label: "Across all creations", icon: Heart, color: "text-danger bg-danger/10 border-danger/20" }
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-default-500">{stat.title}</span>
                    <span className={`p-1.5 rounded-lg border ${stat.color}`}>
                      <stat.icon className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground mt-2">{stat.count}</span>
                  <span className="text-xs text-default-400">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Welcome banner */}
            <div className="p-6 rounded-2xl border border-default-100 dark:border-zinc-800 bg-gradient-to-r from-primary/10 to-secondary/10 flex flex-col gap-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Welcome Chef, {session.user.name}!
              </h3>
              <p className="text-xs text-default-600 dark:text-default-400 leading-relaxed">
                Here you can manage your recipes library, monitor community feedback, bookmark dishes, and upload images.
                {!isPremiumUser && (
                  <strong className="block text-warning-600 dark:text-warning-400 mt-2 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Note: Your free account has a 2-recipe upload limit. Upgrade to unlock unlimited recipe publishing.
                  </strong>
                )}
              </p>
            </div>
          </div>
        )}

        {/* 2. ADD / EDIT RECIPE TAB */}
        {activeTab === "add-recipe" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {editingRecipeId ? "Edit Recipe Details" : "Create New Recipe"}
            </h2>

            {formSuccess && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 font-semibold">
                <CheckCircle className="h-5 w-5" />
                Recipe saved successfully! Redirecting...
              </div>
            )}

            {formError && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 p-6 rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm">
              {/* Title */}
              <TextField className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-default-700">Recipe Title <span className="text-danger">*</span></Label>
                <Input
                  type="text"
                  placeholder="e.g. Grandma's Apple Pie"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground"
                  required
                />
              </TextField>

              {/* Description */}
              <TextField className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-default-700">Description <span className="text-danger">*</span></Label>
                <textarea
                  placeholder="Tell us a little bit about what makes this recipe special..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground min-h-[90px] resize-y"
                  required
                />
              </TextField>

              {/* Form Grid Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-default-700">Category</Label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground h-9"
                  >
                    {["Italian", "Asian", "Mexican", "Desserts", "Seafood", "Salads", "Soups", "Other"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </TextField>

                <TextField className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-default-700">Difficulty</Label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground h-9"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </TextField>

                <div className="grid grid-cols-2 gap-2">
                  <TextField className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-default-700">Prep Time</Label>
                    <Input
                      type="text"
                      value={formPrep}
                      onChange={(e) => setFormPrep(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground"
                    />
                  </TextField>
                  <TextField className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-default-700">Cook Time</Label>
                    <Input
                      type="text"
                      value={formCook}
                      onChange={(e) => setFormCook(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground"
                    />
                  </TextField>
                </div>
              </div>

              {/* Image Uploader */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-default-700">Recipe Image File</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="flex items-center gap-2 justify-center px-4 py-2.5 border border-default-250 dark:border-zinc-700 rounded-lg cursor-pointer bg-default-50 hover:bg-default-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold text-foreground">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4 text-default-500" />
                    )}
                    Upload Image to ImgBB
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  
                  {/* Or Manual URL Input */}
                  <div className="flex-grow w-full flex flex-col gap-1">
                    <Input
                      type="url"
                      placeholder="Or paste an image URL directly..."
                      value={uploadedImageUrl}
                      onChange={(e) => setUploadedImageUrl(e.target.value)}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground"
                    />
                  </div>
                </div>
                {uploadedImageUrl && (
                  <div className="mt-2 relative h-20 w-32 rounded-lg border overflow-hidden">
                    <img src={uploadedImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Ingredients List */}
              <TextField className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-default-700">Ingredients (One item per line) <span className="text-danger">*</span></Label>
                  <span className="text-[10px] text-default-400">Press Enter for new line</span>
                </div>
                <textarea
                  placeholder="350g Flour&#10;2 Eggs&#10;1 cup of milk"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
                  required
                />
              </TextField>

              {/* Instructions List */}
              <TextField className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-default-700">Directions (One step per line) <span className="text-danger">*</span></Label>
                  <span className="text-[10px] text-default-400">Press Enter for new step</span>
                </div>
                <textarea
                  placeholder="Preheat the oven to 375°F.&#10;Whisk the eggs in a large bowl.&#10;Bake for 30 minutes."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-default-50 dark:bg-zinc-800/30 border border-default-200 dark:border-zinc-700 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
                  required
                />
              </TextField>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end border-t border-default-100 dark:border-zinc-800/60 pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => handleTabChange("my-recipes")}
                  className="border border-default-250 dark:border-zinc-700 px-5 py-2.5 text-xs font-semibold text-default-700 dark:text-default-300 rounded-lg hover:bg-default-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 text-xs rounded-lg shadow-md hover:shadow-lg transition-all"
                  isDisabled={isUploading || formSuccess}
                >
                  {formSuccess ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingRecipeId ? (
                    "Save Changes"
                  ) : (
                    "Publish Recipe"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 3. MY RECIPES TAB */}
        {activeTab === "my-recipes" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">My Shared Recipes</h2>
              <Button
                onPress={() => handleTabChange("add-recipe")}
                variant="primary"
                className="bg-primary text-primary-foreground font-semibold py-1.5 px-3.5 text-xs rounded-lg shadow-sm flex items-center gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Recipe
              </Button>
            </div>

            {myRecipes.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Recipe</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Difficulty</th>
                      <th className="px-6 py-3.5 text-center">Likes</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                    {myRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={recipe.image} alt="" className="h-9 w-12 rounded object-cover border" />
                          <span className="font-bold text-foreground truncate max-w-[180px]">{recipe.title}</span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            recipe.difficulty === "Easy"
                              ? "bg-success/15 text-success"
                              : recipe.difficulty === "Medium"
                              ? "bg-warning/15 text-warning"
                              : "bg-danger/15 text-danger"
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{recipe.likes}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <Link href={`/recipes/${recipe.id}`} className="p-1.5 rounded-lg border text-default-500 hover:text-foreground hover:bg-default-50 transition-colors">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditClick(recipe)}
                              className="p-1.5 rounded-lg border text-default-500 hover:text-primary hover:bg-primary/5 transition-colors"
                              title="Edit Recipe"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="p-1.5 rounded-lg border text-default-500 hover:text-danger hover:bg-danger/5 transition-colors"
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
            ) : (
              <div className="py-20 text-center border border-dashed rounded-2xl flex flex-col items-center gap-4">
                <span className="text-3xl">🍲</span>
                <h3 className="font-bold text-foreground">No Recipes Published</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  You haven&apos;t published any culinary recipes yet. Share your first recipe with the community now!
                </p>
                <Button
                  onPress={() => handleTabChange("add-recipe")}
                  variant="outline"
                  size="sm"
                  className="font-semibold border border-default-300 dark:border-zinc-700"
                >
                  Create First Recipe
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 4. FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Favorited Bookmarks</h2>

            {favorites.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Recipe</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Author</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                    {favorites.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={recipe.image} alt="" className="h-9 w-12 rounded object-cover border" />
                          <span className="font-bold text-foreground truncate max-w-[180px]">{recipe.title}</span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4 text-default-550">{recipe.author}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <Link href={`/recipes/${recipe.id}`} className="p-1.5 rounded-lg border text-default-500 hover:text-foreground hover:bg-default-50 transition-colors">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleUnfavorite(recipe.id)}
                              className="p-1.5 rounded-lg border text-danger hover:bg-danger/5 transition-colors"
                              title="Unfavorite item"
                            >
                              <Star className="h-4 w-4 fill-danger text-danger" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-2xl flex flex-col items-center gap-4">
                <span className="text-3xl">⭐</span>
                <h3 className="font-bold text-foreground">No Favorited Recipes</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  Recipes you bookmark as favorites will show up here. Go explore some dishes!
                </p>
                <Link href="/recipes">
                  <Button variant="outline" size="sm" className="font-semibold border border-default-300 dark:border-zinc-700">
                    Explore Dishes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 5. PURCHASED TAB */}
        {activeTab === "purchased" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Unlocked Premium Content</h2>

            {purchased.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-default-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm w-full">
                <table className="min-w-full divide-y divide-default-100 dark:divide-zinc-800 text-sm">
                  <thead className="bg-default-50/50 dark:bg-zinc-900/80 font-semibold text-default-500 uppercase tracking-wider text-left text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Recipe</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Unlocked Price</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-zinc-800 text-default-700 dark:text-default-300">
                    {purchased.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-default-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={recipe.image} alt="" className="h-9 w-12 rounded object-cover border" />
                          <span className="font-bold text-foreground truncate max-w-[180px]">{recipe.title}</span>
                        </td>
                        <td className="px-6 py-4">{recipe.category}</td>
                        <td className="px-6 py-4 font-bold text-success-600">${recipe.price?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/recipes/${recipe.id}`} className="p-1.5 rounded-lg border text-default-500 hover:text-foreground hover:bg-default-50 transition-colors inline-flex">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed rounded-2xl flex flex-col items-center gap-4">
                <span className="text-3xl">🔑</span>
                <h3 className="font-bold text-foreground">No Purchased Recipes</h3>
                <p className="text-xs text-default-500 max-w-xs">
                  When you buy premium chef recipes through our Stripe integration, they will display here with permanent access keys.
                </p>
                <Link href="/recipes?category=All">
                  <Button variant="outline" size="sm" className="font-semibold border border-default-300 dark:border-zinc-700">
                    Browse Premium Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] flex-grow">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-default-500 font-medium">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
