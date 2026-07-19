import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

const PLANS = {
  pro: {
    name: "Pro",
    priceUSD: 9.99,
    recipeLimit: 10, // per month
    durationDays: 30,
  },
  premium: {
    name: "Premium",
    priceUSD: 24.99,
    recipeLimit: Infinity, // unlimited
    durationDays: 365,
  },
} as const;

export type PlanType = keyof typeof PLANS | "free";

/**
 * POST /api/subscription/checkout
 * Creates a Stripe Checkout session for a subscription plan.
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";
    const userSession = await auth.api.getSession({ headers: headersList });
    const user = userSession?.user;

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to subscribe." }, { status: 401 });
    }

    const formData = await request.formData();
    const plan = formData.get("plan") as PlanType;

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    // Check if user already has an active subscription of the same or higher tier
    const subscriptionsCollection = db.collection("subscriptions");
    const activeSub = await subscriptionsCollection.findOne({
      userId: user.id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (activeSub && activeSub.plan === plan) {
      return NextResponse.json(
        { error: `You already have an active ${plan} subscription.` },
        { status: 409 }
      );
    }

    // Simulation mode
    if (!process.env.STRIPE_SECRET_KEY) {
      const simSessionId = `sub_sim_${Math.random().toString(36).substring(2, 11)}`;
      return NextResponse.redirect(
        `${origin}/pricing/success?session_id=${simSessionId}&plan=${plan}&amount=${selectedPlan.priceUSD}`,
        303
      );
    }

    // Real Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(selectedPlan.priceUSD * 100),
            product_data: {
              name: `Flavor Matrix ${selectedPlan.name} Plan`,
              description:
                plan === "pro"
                  ? "10 recipes/month — All premium features"
                  : "Unlimited recipes — All premium features — Lifetime",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        userEmail: user.email,
        plan,
        amount: String(selectedPlan.priceUSD),
        durationDays: String(selectedPlan.durationDays),
      },
      mode: "payment",
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&amount=${selectedPlan.priceUSD}`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    console.error("[subscription/checkout] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
