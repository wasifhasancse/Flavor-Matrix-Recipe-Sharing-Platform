import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const sessionUser = userSession?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = db.collection("users");
    
    // Strict DB verification of admin role
    const dbAdminUser = await usersCollection.findOne({ email: sessionUser.email });
    
    if (!dbAdminUser || dbAdminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    // Fetch all users
    const allUsers = await usersCollection.find({}).toArray();

    // Fetch all payments and subscriptions to aggregate total money spent
    const paymentsCollection = db.collection("payments");
    const subscriptionsCollection = db.collection("subscriptions");

    const allPayments = await paymentsCollection.find({ paymentStatus: "paid" }).toArray();
    const allSubscriptions = await subscriptionsCollection.find({
      $or: [{ status: "active" }, { status: "superseded" }, { status: "expired" }]
    }).toArray();

    // Aggregate spend per user
    const userSpendMap: Record<string, number> = {};

    allPayments.forEach((p) => {
      const userId = p.userId;
      if (userId) {
        userSpendMap[userId] = (userSpendMap[userId] || 0) + (Number(p.amount) || 0);
      }
    });

    allSubscriptions.forEach((s) => {
      const userId = s.userId;
      if (userId) {
        userSpendMap[userId] = (userSpendMap[userId] || 0) + (Number(s.amount) || 0);
      }
    });

    // Map spend to users
    const enrichedUsers = allUsers.map((u) => {
      const userIdStr = u.id || u._id?.toString();
      return {
        ...u,
        totalMoneySpent: userSpendMap[userIdStr] || 0,
      };
    });

    // Sort by totalMoneySpent descending
    enrichedUsers.sort((a, b) => b.totalMoneySpent - a.totalMoneySpent);

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
    });
  } catch (error: any) {
    console.error("[admin/users] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
