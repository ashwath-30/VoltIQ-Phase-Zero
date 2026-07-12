import { NextRequest, NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/env";
import type Stripe from "stripe";

// This endpoint is called by Stripe's servers, not by a logged-in user —
// there's no session or cookie to check. Instead, we verify the request
// is genuinely from Stripe using a signature check, which is why the RAW
// (unparsed) request body matters here — signature verification breaks
// if the body has been touched or re-serialized in any way.
export async function POST(request: NextRequest) {
  const stripe = createStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireEnv(process.env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (userId) {
          await supabase
            .from("profiles")
            .update({
              plan: "pro",
              stripe_subscription_id: session.subscription as string,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await supabase
          .from("profiles")
          .update({ plan: isActive ? "pro" : "free" })
          .eq("stripe_customer_id", subscription.customer as string);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("profiles")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", subscription.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
