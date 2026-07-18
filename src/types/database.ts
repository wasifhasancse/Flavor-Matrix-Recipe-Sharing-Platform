/**
 * Database Architecture Schema Types for Flavor Matrix Recipe Platform
 */

// 1. Users Schema (when register)
export interface UserSchema {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  image: string;
  role: "user" | "admin";
  isBlocked: boolean;
  isPremium: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 2. Recipes Schema (when add)
export interface RecipeSchema {
  id?: string;
  _id?: string;
  recipeName: string;
  recipeImage: string;
  category: string;
  cuisineType: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  preparationTime: string;
  ingredients: string[];
  instructions: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  likesCount: number;
  isFeatured: boolean;
  status: "published" | "draft" | "pending" | "archived";
  price?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 3. Favorites Schema (when add by click in favorite button)
export interface FavoriteSchema {
  id?: string;
  _id?: string;
  userEmail: string;
  userId: string;
  recipeId: string;
  addedAt: Date | string;
}

// 4. Reports Schema (when user report a recipe)
export interface ReportSchema {
  id?: string;
  _id?: string;
  recipeId: string;
  reporterEmail: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Date | string;
}

// 5. Payments Schema (when successfully)
export interface PaymentSchema {
  id?: string;
  _id?: string;
  userEmail: string;
  userId: string;
  amount: number;
  recipeId: string;
  transactionId: string;
  paymentStatus: "succeeded" | "failed" | "pending";
  paidAt: Date | string;
}
