import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const stripe = createStripeClient();
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, name")
    .eq("id", user.id)
    .single();

  // Reuse an existing Stripe customer if we already made one for this
  // user (e.g. they subscribed before and cancelled), otherwise create
  // a fresh one and save it for next time.
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.name || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: requireEnv(process.env.STRIPE_PRICE_ID, "STRIPE_PRICE_ID"), quantity: 1 }],
    success_url: `${origin}/settings?upgraded=true`,
    cancel_url: `${origin}/settings`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
