import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/payments/my
 * Returns all payments for the currently authenticated user.
 */
export async function GET() {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentsCollection = db.collection("payments");
    const subscriptionsCollection = db.collection("subscriptions");

    const recipePayments = await paymentsCollection
      .find({ userId: user.id })
      .toArray();

    const subscriptions = await subscriptionsCollection
      .find({ userId: user.id })
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

    return NextResponse.json({ success: true, payments: unified });
  } catch (error: any) {
    console.error("[payments/my] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
