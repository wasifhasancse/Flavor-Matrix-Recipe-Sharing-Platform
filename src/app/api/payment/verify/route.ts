import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { session_id, recipe_id, amount } = await request.json();

    if (!session_id || !recipe_id) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    const user = sessionData?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let paymentData: Record<string, unknown> = {
      userEmail: user.email,
      userId: user.id,
      amount: Number(amount) || 0,
      recipeId: recipe_id,
      transactionId: session_id,
      paymentStatus: "paid",
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If real Stripe key and real session (not simulated), verify with Stripe
    if (process.env.STRIPE_SECRET_KEY && !session_id.startsWith("cs_sim_")) {
      const { stripe } = await import("@/lib/stripe");
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

      if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not yet verified by Stripe." }, { status: 400 });
      }

      // Use verified data from Stripe metadata & session
      paymentData = {
        ...paymentData,
        userEmail: checkoutSession.metadata?.userEmail || user.email,
        userId: checkoutSession.metadata?.userId || user.id,
        recipeId: checkoutSession.metadata?.recipeId || recipe_id,
        amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : paymentData.amount,
        paymentStatus: checkoutSession.payment_status,
        transactionId: session_id,
        paidAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Store in MongoDB payments collection (deduplicate by transactionId)
    const paymentsCollection = db.collection("payments");
    const existingPayment = await paymentsCollection.findOne({ transactionId: session_id });

    if (!existingPayment) {
      await paymentsCollection.insertOne(paymentData);
    }

    return NextResponse.json({ success: true, payment: paymentData });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment." }, { status: 500 });
  }
}
