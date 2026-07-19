"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { AlertTriangle, CheckCircle, Upload, Loader2, PlusCircle } from "lucide-react";
import { Recipe } from "@/data/recipes";
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AddRecipePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

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

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isPremiumUser] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user) {
      const createdKey = `created_recipes_${session.user.id}`;
      const stored = localStorage.getItem(createdKey);
      if (stored) {
        setMyRecipes(JSON.parse(stored));
      }
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setFormError(null);

    if (!isPremiumUser && myRecipes.length >= 2) {
      setFormError("Free Standard Accounts are limited to 2 published recipes. Upgrade to Premium for unlimited publishing!");
      return;
    }

    if (!formTitle || !formDesc || !formIngredients || !formInstructions) {
      setFormError("Please complete all required recipe fields.");
      return;
    }

    const ingredientsArray = formIngredients.split("\n").map((i) => i.trim()).filter((i) => i.length > 0);
    const instructionsArray = formInstructions.split("\n").map((i) => i.trim()).filter((i) => i.length > 0);
    const defaultImage = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

    const createdKey = `created_recipes_${session.user.id}`;

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

    const finalRecipes = [newRecipe, ...myRecipes];
    setMyRecipes(finalRecipes);
    localStorage.setItem(createdKey, JSON.stringify(finalRecipes));
    setFormSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/user/my-recipes");
    }, 1000);
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
        </div>

        {/* Image Uploader */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-default-500">Recipe Image</label>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="flex items-center gap-2 justify-center px-4 py-3 border border-default-200 dark:border-zinc-800 rounded-xl cursor-pointer bg-default-50 hover:bg-default-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-smooth text-xs font-semibold text-foreground">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-default-400" />}
              Upload to ImgBB
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" disabled={isUploading} />
            </label>

            <div className="flex-1 w-full">
              <input
                type="url"
                placeholder="Or paste an image URL..."
                value={uploadedImageUrl}
                onChange={(e) => setUploadedImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 focus:border-primary outline-none text-foreground font-medium"
              />
            </div>
          </div>
          {uploadedImageUrl && (
            <div className="mt-2 relative h-20 w-32 rounded-xl border overflow-hidden">
              <img src={uploadedImageUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
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
