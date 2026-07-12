"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Zap, Loader2 } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FREE_TIER_UPLOAD_LIMIT, FREE_TIER_CHAT_LIMIT } from "@/lib/usage-limits";

const freeFeatures = [
  `${FREE_TIER_UPLOAD_LIMIT} bill uploads per month`,
  `${FREE_TIER_CHAT_LIMIT} AI Assistant messages per month`,
  "Full Dashboard, Analytics & Reports",
  "Real forecasting & Energy Health Score",
  "Peer comparison to similar homes",
];

const proFeatures = [
  "Unlimited bill uploads",
  "Unlimited AI Assistant access",
  "Everything in Free, with no monthly caps",
  "Priority support",
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/register?next=/pricing");
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      <MarketingNavbar />
      <main className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight">Simple, honest pricing</h1>
            <p className="mt-4 text-muted-foreground">
              Start free. Upgrade whenever the monthly limits actually get in your way — cancel anytime.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Everything you need to get started</CardDescription>
                <p className="pt-4 font-display text-4xl font-bold">
                  $0<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {freeFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="relative border-primary-300 shadow-glow dark:border-primary-800">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Zap className="h-3 w-3" />
                  Most popular
                </span>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For anyone who wants VoltIQ without limits</CardDescription>
                <p className="pt-4 font-display text-4xl font-bold">
                  $5<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Upgrade to Pro"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Payments are processed securely by Stripe. VoltIQ never sees or stores your card details.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
