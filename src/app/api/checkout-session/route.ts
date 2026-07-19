import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    // ── 1. Authenticate user ──────────────────────────────────────────────────
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase a recipe." },
        { status: 401 }
      );
    }

    // ── 2. Parse and validate form data ───────────────────────────────────────
    const formData = await request.formData();
    const recipeId    = (formData.get("recipeId")    as string | null)?.trim();
    const priceRaw    = (formData.get("price")       as string | null)?.trim();
    const recipeName  = (formData.get("recipeName")  as string | null)?.trim() || "Premium Recipe";
    const recipeAuthor= (formData.get("recipeAuthor")as string | null)?.trim() || "Chef";
    const recipeImage = (formData.get("recipeImage") as string | null)?.trim() || "";

    if (!recipeId || !priceRaw) {
      return NextResponse.json(
        { error: "Missing required fields: recipeId, price." },
        { status: 400 }
      );
    }

    const priceFloat = parseFloat(priceRaw);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      return NextResponse.json(
        { error: "Invalid price value. Must be a positive number." },
        { status: 400 }
      );
    }

    const priceInCents = Math.round(priceFloat * 100);

    // ── 3. Guard: prevent duplicate purchase (same user + same recipe) ─────────
    const paymentsCollection = db.collection("payments");
    const existingPurchase = await paymentsCollection.findOne({
      userId: user.id,
      recipeId,
      paymentStatus: "paid",
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You have already purchased this recipe." },
        { status: 409 } // 409 Conflict
      );
    }

    // ── 4. Simulation mode (no Stripe key) ────────────────────────────────────
    if (!process.env.STRIPE_SECRET_KEY) {
      const simSessionId = `cs_sim_${Math.random().toString(36).substring(2, 11)}`;
      return NextResponse.redirect(
        `${origin}/payment/success?session_id=${simSessionId}&recipe_id=${recipeId}&amount=${priceFloat}`,
        303
      );
    }

    // ── 5. Create real Stripe Checkout Session ────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceInCents,
            product_data: {
              name: recipeName,
              description: `Exclusive recipe by ${recipeAuthor} — Lifetime access`,
              images: recipeImage ? [recipeImage] : [],
            },
          },
          quantity: 1,
        },
      ],
      // Embed all required data in metadata so the webhook / verify route
      // can reconstruct the payment record without trusting the client.
      metadata: {
        userId:      user.id,
        userEmail:   user.email,
        userName:    user.name   || "",
        recipeId,
        recipeName,
        recipeAuthor,
        price:       String(priceFloat),
      },
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&recipe_id=${recipeId}&amount=${priceFloat}`,
      cancel_url:  `${origin}/payment/cancel?recipe_id=${recipeId}`,
    });

    // Redirect the browser directly to Stripe — no client-side JS needed.
    return NextResponse.redirect(session.url!, 303);

  } catch (err: any) {
    console.error("[checkout-session] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session." },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Stripe Payment API is working!" });
}
