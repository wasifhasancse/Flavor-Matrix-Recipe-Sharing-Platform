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
    const payments = await paymentsCollection
      .find({ userId: user.id })
      .sort({ paidAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error("[payments/my] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
