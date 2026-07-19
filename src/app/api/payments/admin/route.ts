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
    const payments = await paymentsCollection
      .find({})
      .sort({ paidAt: -1 })
      .toArray();

    const totalRevenue = payments
      .filter((p: any) => p.paymentStatus === "paid")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    return NextResponse.json({ success: true, payments, totalRevenue });
  } catch (error: any) {
    console.error("[payments/admin] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
