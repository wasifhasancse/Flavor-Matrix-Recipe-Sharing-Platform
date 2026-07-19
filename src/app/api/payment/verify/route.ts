import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

    let paymentData: any = {
      userEmail: user.email,
      userId: user.id,
      amount: Number(amount) || 0,
      recipeId: recipe_id,
      transactionId: session_id,
      paymentStatus: "paid", // Assuming simulated success if no stripe
      paidAt: new Date(),
    };

    // If stripe is configured, verify with Stripe
    if (process.env.STRIPE_SECRET_KEY && !session_id.startsWith("cs_sim_")) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
      
      if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not verified." }, { status: 400 });
      }

      paymentData = {
        ...paymentData,
        amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : paymentData.amount,
        paymentStatus: checkoutSession.payment_status,
      };
    }

    // Store in MongoDB payments collection
    const paymentsCollection = db.collection("payments");
    
    // Check if payment already exists to prevent duplicate entries on page reload
    const existingPayment = await paymentsCollection.findOne({ transactionId: session_id });
    if (!existingPayment) {
      await paymentsCollection.insertOne({
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ success: true, payment: paymentData });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment." }, { status: 500 });
  }
}
