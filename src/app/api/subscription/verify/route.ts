import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

const PLAN_DURATIONS: Record<string, number> = {
  pro: 30,
  premium: 365,
};

/**
 * POST /api/subscription/verify
 * Verifies a subscription payment, stores subscription record, and returns updated plan info.
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, plan, amount } = body;

    if (!session_id || !plan) {
      return NextResponse.json({ error: "Missing session_id or plan." }, { status: 400 });
    }

    const subscriptionsCollection = db.collection("subscriptions");

    // Deduplication: same session_id
    const existing = await subscriptionsCollection.findOne({ sessionId: session_id });
    if (existing) {
      return NextResponse.json({ success: true, subscription: existing, duplicate: true });
    }

    let verifiedAmount = Number(amount) || 0;
    let verifiedUserId = user.id;
    let verifiedEmail = user.email;

    // Verify with Stripe if key is configured
    if (process.env.STRIPE_SECRET_KEY && !session_id.startsWith("sub_sim_")) {
      const { stripe } = await import("@/lib/stripe");
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

      if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Payment not completed." },
          { status: 402 }
        );
      }

      // Cross-check ownership
      const metaUserId = checkoutSession.metadata?.userId;
      if (metaUserId && metaUserId !== user.id) {
        return NextResponse.json({ error: "User mismatch." }, { status: 403 });
      }

      verifiedAmount = checkoutSession.amount_total
        ? checkoutSession.amount_total / 100
        : verifiedAmount;
      verifiedUserId = checkoutSession.metadata?.userId || user.id;
      verifiedEmail = checkoutSession.metadata?.userEmail || user.email;
    }

    const now = new Date();
    const durationDays = PLAN_DURATIONS[plan] || 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Deactivate any previous active subscription
    await subscriptionsCollection.updateMany(
      { userId: verifiedUserId, status: "active" },
      { $set: { status: "superseded", updatedAt: now } }
    );

    const subscription = {
      userId: verifiedUserId,
      userEmail: verifiedEmail,
      plan, // "pro" | "premium"
      status: "active",
      sessionId: session_id,
      amount: verifiedAmount,
      startDate: now,
      endDate,
      createdAt: now,
      updatedAt: now,
    };

    await subscriptionsCollection.insertOne(subscription);

    return NextResponse.json({ success: true, subscription });
  } catch (error: any) {
    console.error("[subscription/verify] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/subscription/verify
 * Returns current subscription status for logged-in user.
 */
export async function GET() {
  try {
    const headersList = await headers();
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json({ plan: "free", isActive: false });
    }

    const subscriptionsCollection = db.collection("subscriptions");
    const now = new Date();

    const activeSub = await subscriptionsCollection.findOne(
      { userId: user.id, status: "active", endDate: { $gt: now } },
      { sort: { createdAt: -1 } }
    );

    if (!activeSub) {
      return NextResponse.json({ plan: "free", isActive: false });
    }

    return NextResponse.json({
      plan: activeSub.plan,
      isActive: true,
      startDate: activeSub.startDate,
      endDate: activeSub.endDate,
      daysRemaining: Math.ceil(
        (new Date(activeSub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    });
  } catch (error: any) {
    return NextResponse.json({ plan: "free", isActive: false });
  }
}
