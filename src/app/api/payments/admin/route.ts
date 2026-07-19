import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/payments/admin
 * Returns ALL payments (admin only).
 */
export async function GET() {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const user = userSession?.user as any;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const paymentsCollection = db.collection("payments");
    const subscriptionsCollection = db.collection("subscriptions");

    const recipePayments = await paymentsCollection
      .find({})
      .toArray();

    const subscriptions = await subscriptionsCollection
      .find({})
      .toArray();

    const unified = [
      ...recipePayments.map((p: any) => ({
        ...p,
        itemType: "recipe",
      })),
      ...subscriptions.map((s: any) => ({
        ...s,
        itemType: "subscription",
        transactionId: s.sessionId,
        paymentStatus: s.status === "active" || s.status === "superseded" ? "paid" : "pending",
        paidAt: s.createdAt,
      }))
    ];

    unified.sort((a: any, b: any) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());

    const totalRevenue = unified
      .filter((p: any) => p.paymentStatus === "paid")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    return NextResponse.json({ success: true, payments: unified, totalRevenue });
  } catch (error: any) {
    console.error("[payments/admin] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
