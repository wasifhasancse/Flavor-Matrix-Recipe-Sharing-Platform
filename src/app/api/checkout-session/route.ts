import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { mockRecipes } from "@/data/recipes";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    // Get user session
    const userSession = await auth.api.getSession({ headers: await headers() });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse form data (from the HTML form submission)
    const formData = await request.formData();
    const recipeId = formData.get("recipeId") as string;
    const price = formData.get("price") as string;
    const recipeName = formData.get("recipeName") as string;
    const recipeAuthor = formData.get("recipeAuthor") as string;
    const recipeImage = formData.get("recipeImage") as string;

    if (!recipeId || !price) {
      return NextResponse.json(
        { error: "Missing required fields: recipeId, price" },
        { status: 400 }
      );
    }

    const priceInCents = Math.round(Number(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      return NextResponse.json(
        { error: "Invalid price value." },
        { status: 400 }
      );
    }

    // If Stripe key is not configured, simulate a redirect to success page
    if (!process.env.STRIPE_SECRET_KEY) {
      const simSessionId = `cs_sim_${Math.random().toString(36).substring(2, 11)}`;
      return NextResponse.redirect(
        `${origin}/payment/success?session_id=${simSessionId}&recipe_id=${recipeId}&amount=${price}`,
        303
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceInCents,
            product_data: {
              name: recipeName || "Premium Recipe",
              description: `By ${recipeAuthor || "Chef"}`,
              images: recipeImage ? [recipeImage] : [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name || "",
        recipeId,
        recipeName: recipeName || "",
        price: Number(price),
      },
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&recipe_id=${recipeId}&amount=${price}`,
      cancel_url: `${origin}/payment/cancel?recipe_id=${recipeId}`,
    });

    // Redirect directly to Stripe Checkout
    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    console.error("Stripe Checkout Session Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session." },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Stripe Payment API is working!" });
}
