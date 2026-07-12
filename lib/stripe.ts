import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

export function createStripeClient() {
  // apiVersion intentionally omitted — pinning a specific version string
  // risks the same kind of SDK-type-vs-runtime mismatch that broke the
  // Anthropic PDF integration during deployment. Omitting it just uses
  // your Stripe account's configured default API version instead.
  return new Stripe(requireEnv(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"));
}
