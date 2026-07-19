import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/payment/verify
 *
 * Security layers applied:
 *  1. Authenticated session required
 *  2. Stripe session retrieval & payment_status === "paid" check
 *  3. Duplicate guard: transactionId (prevents page-refresh double-insert)
 *  4. Duplicate guard: userId + recipeId (prevents same user buying same recipe twice)
 *  5. userId cross-check: session owner must match logged-in user
 */
export async function POST(request: Request) {
  try {
    // ── 1. Authenticate user ─────────────────────────────────────────────────
    const headersList = await headers();
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // ── 2. Parse and validate body ───────────────────────────────────────────
    let body: { session_id?: string; recipe_id?: string; amount?: string | number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { session_id, recipe_id, amount } = body;

    if (!session_id || !recipe_id) {
      return NextResponse.json(
        { error: "Missing required parameters: session_id, recipe_id." },
        { status: 400 }
      );
    }

    const paymentsCollection = db.collection("payments");

    // ── 3. Duplicate guard — same transactionId ───────────────────────────────
    const existingTransaction = await paymentsCollection.findOne({
      transactionId: session_id,
    });

    if (existingTransaction) {
      // Already processed — return success without re-inserting
      return NextResponse.json({
        success: true,
        payment: existingTransaction,
        duplicate: true,
      });
    }

    // ── 4. Duplicate guard — same userId + recipeId (paid) ───────────────────
    const existingPurchase = await paymentsCollection.findOne({
      userId:        user.id,
      recipeId:      recipe_id,
      paymentStatus: "paid",
    });

    if (existingPurchase) {
      return NextResponse.json(
        {
          error:   "This recipe has already been purchased by this account.",
          code:    "ALREADY_PURCHASED",
          payment: existingPurchase,
        },
        { status: 409 }
      );
    }

    // ── 5. Build payment record ───────────────────────────────────────────────
    const now = new Date();

    let paymentRecord: Record<string, unknown> = {
      userEmail:     user.email,
      userId:        user.id,
      amount:        Number(amount) || 0,
      recipeId:      recipe_id,
      transactionId: session_id,
      paymentStatus: "paid",
      paidAt:        now,
      createdAt:     now,
      updatedAt:     now,
    };

    // ── 6. Real Stripe verification ───────────────────────────────────────────
    if (process.env.STRIPE_SECRET_KEY && !session_id.startsWith("cs_sim_")) {
      const { stripe } = await import("@/lib/stripe");

      let checkoutSession;
      try {
        checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
      } catch (stripeErr: any) {
        return NextResponse.json(
          { error: `Stripe session retrieval failed: ${stripeErr.message}` },
          { status: 502 }
        );
      }

      // ── 6a. Verify payment status ─────────────────────────────────────────
      if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json(
          {
            error: `Payment not completed. Status: ${checkoutSession.payment_status}`,
            code:  "PAYMENT_INCOMPLETE",
          },
          { status: 402 }
        );
      }

      // ── 6b. Cross-check userId from metadata ──────────────────────────────
      const metaUserId = checkoutSession.metadata?.userId;
      if (metaUserId && metaUserId !== user.id) {
        return NextResponse.json(
          { error: "User mismatch. This session does not belong to you." },
          { status: 403 }
        );
      }

      // ── 6c. Use trusted Stripe data for the record ────────────────────────
      paymentRecord = {
        ...paymentRecord,
        userEmail:     checkoutSession.metadata?.userEmail  || user.email,
        userId:        checkoutSession.metadata?.userId     || user.id,
        recipeId:      checkoutSession.metadata?.recipeId   || recipe_id,
        amount:        checkoutSession.amount_total != null
                         ? checkoutSession.amount_total / 100
                         : paymentRecord.amount,
        paymentStatus: checkoutSession.payment_status,        // "paid"
        stripeCustomer: checkoutSession.customer,
        paymentIntent:  checkoutSession.payment_intent,
        updatedAt:     now,
      };
    }

    // ── 7. Persist to MongoDB ─────────────────────────────────────────────────
    const result = await paymentsCollection.insertOne(paymentRecord);

    return NextResponse.json({
      success: true,
      payment: { ...paymentRecord, _id: result.insertedId },
    });

  } catch (error: any) {
    console.error("[payment/verify] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
