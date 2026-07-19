import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const user = userSession?.user as any;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = db.collection("users");
    
    // Strict DB verification of admin role
    const dbUser = await usersCollection.findOne({ email: user.email });
    
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const recipesCollection = db.collection("recipes");
    const reportsCollection = db.collection("reports");

    // Aggregate counts
    const totalUsers = await usersCollection.countDocuments();
    const premiumUsers = await usersCollection.countDocuments({ isPremium: true });
    const totalRecipes = await recipesCollection.countDocuments();
    const totalReports = await reportsCollection.countDocuments();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        totalRecipes,
        totalReports,
      }
    });
  } catch (error: any) {
    console.error("[admin/dashboard] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
