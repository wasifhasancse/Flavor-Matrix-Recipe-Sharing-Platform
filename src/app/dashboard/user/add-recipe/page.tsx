"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { AlertTriangle, CheckCircle, Upload, Loader2, PlusCircle, Sparkles } from "lucide-react";
import { Recipe } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AddRecipePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Italian");
  const [formCuisine, setFormCuisine] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formPrep, setFormPrep] = useState("10 mins");
  const [formCook, setFormCook] = useState("15 mins");
  const [formPrice, setFormPrice] = useState("");
  const [formIngredients, setFormIngredients] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [limitData, setLimitData] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      // 1. Fetch current recipes for local UI rendering (cache)
      const createdKey = `created_recipes_${session.user.id}`;
      const stored = localStorage.getItem(createdKey);
      if (stored) {
        setMyRecipes(JSON.parse(stored));
      }

      // 2. Fetch real limits from the backend
      fetch("/api/subscription/recipe-limit")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setLimitData(data);
        })
        .catch(console.error);
    }
  }, [session]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setUploadedImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80");
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
          setFormError("ImgBB upload failed. Please try again or paste an image URL.");
        }
      }
    } catch (err) {
      setFormError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiScan = async () => {
    if (!uploadedImageUrl) return;
    setIsAnalyzing(true);
    setFormError(null);
    try {
      // Fetch a valid JWT for the backend
      const tokenRes = await fetch("/api/auth/token");
      const tokenData = await tokenRes.json();
      if (!tokenData.success || !tokenData.token) {
        throw new Error("Authentication failed. Please log in again.");
      }
      
      const token = tokenData.token;
      localStorage.setItem("token", token);

      const res = await fetch("http://localhost:5000/api/ai/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: uploadedImageUrl })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze image");
      }

      const recipe = data.data;
      if (recipe.recipeName) setFormTitle(recipe.recipeName);
      if (recipe.description) setFormDesc(recipe.description);
      if (recipe.category) setFormCategory(recipe.category);
      if (recipe.cuisineType) setFormCuisine(recipe.cuisineType);
      if (recipe.difficultyLevel) setFormDifficulty(recipe.difficultyLevel);
      if (recipe.preparationTime !== undefined) {
        setFormPrep(`${recipe.preparationTime} mins`);
      }
      if (recipe.cookTime !== undefined) {
        setFormCook(`${recipe.cookTime} mins`);
      }
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        setFormIngredients(recipe.ingredients.join("\n"));
      }
      if (recipe.instructions && Array.isArray(recipe.instructions)) {
        setFormInstructions(recipe.instructions.join("\n"));
      }
      
    } catch (err: any) {
      setFormError(err.message || "AI Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setFormError(null);

    // Front-end pre-check for limits
    if (limitData && !limitData.canCreate) {
      router.push("/pricing");
      return;
    }

    if (!formTitle || !formDesc || !formIngredients || !formInstructions) {
      setFormError("Please complete all required recipe fields.");
      return;
    }

    setIsUploading(true); // Re-using this state to disable button during submit

    try {
      const ingredientsArray = formIngredients.split("\n").map((i) => i.trim()).filter((i) => i.length > 0);
      const instructionsArray = formInstructions.split("\n").map((i) => i.trim()).filter((i) => i.length > 0);
      const defaultImage = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

      // Fetch a valid JWT for the backend
      const tokenRes = await fetch("/api/auth/token");
      const tokenData = await tokenRes.json();
      if (!tokenData.success || !tokenData.token) {
        throw new Error("Authentication failed. Please log in again.");
      }
      
      const token = tokenData.token;
      localStorage.setItem("token", token);

      const res = await fetch("http://127.0.0.1:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          category: formCategory,
          cuisineType: formCuisine,
          difficulty: formDifficulty,
          prepTime: formPrep,
          cookTime: formCook,
          price: formPrice ? Number(formPrice) : 0,
          ingredients: ingredientsArray,
          instructions: instructionsArray,
          image: uploadedImageUrl || defaultImage,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error && data.error.includes("limit reached")) {
          router.push("/pricing");
          return;
        }
        throw new Error(data.error || "Failed to publish recipe");
      }

      setFormSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push("/dashboard/user/my-recipes");
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending) return null;

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-default-100 dark:border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <DynamicBreadcrumb />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <PlusCircle className="h-7 w-7 text-primary" />
            <span>Create New Recipe</span>
          </h1>
        </div>
      </div>

      {limitData && !limitData.canCreate && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>You have reached your {limitData.plan} plan limit of {limitData.limit} recipes.</span>
          </div>
          <Button
            size="sm"
            className="bg-rose-500 text-white font-bold"
            onPress={() => router.push("/pricing")}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 font-semibold">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          Recipe saved successfully! Redirecting...
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {formError}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl glass-panel ambient-glow-orange">
        
        {/* Image Uploader & AI Analyzer - MOVED TO TOP */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-5 rounded-2xl border border-amber-500/20 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">Pro Tip: Start here!</h3>
          </div>
          <p className="text-xs text-default-600 font-medium mb-3">
            Upload a dish image and click "Scan Image with AI". Our AI Chef will magically write the entire recipe, description, ingredients, and instructions for you!
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-default-500">Recipe Image & AI Analysis</label>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Drop Zone Simulation */}
              <div className="flex-1 border-2 border-dashed border-default-200 dark:border-zinc-800 rounded-2xl bg-default-50/50 hover:bg-default-100/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 transition-colors p-6 flex flex-col items-center justify-center gap-3 relative group">
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploading || isAnalyzing} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs font-bold">Uploading to ImgBB...</span>
                  </div>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-default-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-default-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">Click or drag image to upload</p>
                      <p className="text-xs text-default-400 font-medium mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                  </>
                )}
              </div>

              {/* URL Input & AI Action */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 h-full">
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={uploadedImageUrl}
                    onChange={(e) => setUploadedImageUrl(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
                    disabled={isAnalyzing}
                  />
                  
                  <div className="flex gap-4 mt-2 h-full">
                    {uploadedImageUrl && (
                      <div className="relative w-24 h-24 rounded-xl border border-default-200 dark:border-zinc-800 overflow-hidden shrink-0">
                        <img src={uploadedImageUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex items-end">
                      <Button 
                        isDisabled={!uploadedImageUrl || isAnalyzing} 
                        onPress={handleAiScan}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>AI Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            <span>Scan Image with AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="mt-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Sparkles className="h-6 w-6" />
                <p className="text-sm font-bold text-center">Our AI Chef is visually analyzing your dish...<br/>Extracting ingredients, guessing cuisine, and writing instructions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-default-500">
            Recipe Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Grandma's Artisan Spaghetti Carbonara"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-default-500">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Tell us what makes this dish special..."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[90px] resize-y"
            required
          />
        </div>

        {/* Form Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-default-500">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
            >
              {["Italian", "Asian", "Mexican", "Desserts", "Seafood", "Salads", "Soups", "Other"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-default-500">Difficulty</label>
            <select
              value={formDifficulty}
              onChange={(e) => setFormDifficulty(e.target.value as any)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-default-500">Prep Time</label>
              <input
                type="text"
                value={formPrep}
                onChange={(e) => setFormPrep(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-default-500">Cook Time</label>
              <input
                type="text"
                value={formCook}
                onChange={(e) => setFormCook(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-default-500">Cuisine Type</label>
            <input
              type="text"
              placeholder="e.g. Italian, Thai"
              value={formCuisine}
              onChange={(e) => setFormCuisine(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-default-500">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00 (Free)"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium h-11"
            />
          </div>
        </div>

        {/* Ingredients List */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-default-500">
            Ingredients (One item per line) <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="350g Spaghetti&#10;150g Pancetta&#10;4 Egg yolks"
            value={formIngredients}
            onChange={(e) => setFormIngredients(e.target.value)}
            className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
            required
          />
        </div>

        {/* Instructions List */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-default-500">
            Instructions (One step per line) <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Bring salted water to a boil...&#10;Crisp pancetta in skillet...&#10;Toss pasta with egg mixture..."
            value={formInstructions}
            onChange={(e) => setFormInstructions(e.target.value)}
            className="w-full p-4 text-sm rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground min-h-[100px] resize-y"
            required
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end border-t border-default-100 dark:border-zinc-800 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/user")}
            className="border border-default-200 dark:border-zinc-800 px-5 py-2.5 text-xs font-semibold text-foreground rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={isUploading || formSuccess}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 text-xs rounded-xl shadow-md cursor-pointer border-none"
          >
            {formSuccess ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Recipe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
