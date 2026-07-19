import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

const PLAN_LIMITS: Record<string, number> = {
  free: 2,      // 2 recipes lifetime
  pro: 10,      // 10 recipes per calendar month
  premium: Infinity, // unlimited
};

/**
 * GET /api/subscription/recipe-limit
 * Returns current plan, recipe usage, and remaining quota for the logged-in user.
 */
export async function GET() {
  try {
    const headersList = await headers();
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionsCollection = db.collection("subscriptions");
    const now = new Date();

    // Get active subscription
    const activeSub = await subscriptionsCollection.findOne(
      { userId: user.id, status: "active", endDate: { $gt: now } },
      { sort: { createdAt: -1 } }
    );

    if (!activeSub) {
      // Auto-downgrade logic for lazy syncing if their previous plan expired
      const usersCollection = db.collection("users");
      await usersCollection.updateOne(
        { email: user.email },
        { $set: { isPremium: false, subscriptionPlan: "free", updatedAt: now } }
      );
    }

    const currentPlan: string = activeSub?.plan || "free";
    const limit = PLAN_LIMITS[currentPlan] ?? 2;

    // Count recipes created by this user
    const recipesCollection = db.collection("recipes");
    let recipeCount = 0;

    if (currentPlan === "pro") {
      // Count only this calendar month's recipes for Pro
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      recipeCount = await recipesCollection.countDocuments({
        authorId: user.id,
        createdAt: { $gte: startOfMonth },
      });
    } else if (currentPlan === "free") {
      // Count total lifetime recipes for Free
      recipeCount = await recipesCollection.countDocuments({ authorId: user.id });
    }
    // Premium: no limit needed, but count anyway for UI
    else {
      recipeCount = await recipesCollection.countDocuments({ authorId: user.id });
    }

    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - recipeCount);
    const canCreate = remaining > 0;

    return NextResponse.json({
      plan: currentPlan,
      limit: limit === Infinity ? null : limit,
      used: recipeCount,
      remaining: remaining === Infinity ? null : remaining,
      canCreate,
      isActive: !!activeSub,
      endDate: activeSub?.endDate || null,
    });
  } catch (error: any) {
    console.error("[subscription/recipe-limit] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
