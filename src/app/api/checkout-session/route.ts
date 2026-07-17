import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mockRecipes } from "@/data/recipes";

export async function POST(request: Request) {
  try {
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId in request body." }, { status: 400 });
    }

    const recipe = mockRecipes.find((r) => r.id === recipeId);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }

    const price = recipe.price || 0;

    if (price <= 0) {
      return NextResponse.json({ error: "This recipe is free and does not require purchasing." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn(
        "STRIPE_SECRET_KEY is not defined. Simulating Stripe checkout session in development mode."
      );
      // Return a simulated checkout redirect that immediately lands on the success page
      return NextResponse.json({
        url: `${origin}/recipes/${recipeId}?payment_success=true`,
        simulated: true,
      });
    }

    // Initialize real Stripe client
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.accompany" as any, // fallback dynamic cast for testing
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: recipe.title,
              description: recipe.description,
              images: [recipe.image],
            },
            unit_amount: Math.round(price * 100), // In cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/recipes/${recipeId}?payment_success=true`,
      cancel_url: `${origin}/recipes/${recipeId}?payment_cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Session Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session." }, { status: 500 });
  }
}
