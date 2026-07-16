"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FREE_TIER_UPLOAD_LIMIT, FREE_TIER_CHAT_LIMIT, startOfCurrentMonthISO } from "@/lib/usage-limits";

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

export default function UpgradePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [chatsUsed, setChatsUsed] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { count: uploadCount }, { count: chatCount }] = await Promise.all([
        supabase.from("profiles").select("plan").eq("id", user.id).single(),
        supabase
          .from("bills")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("upload_date", startOfCurrentMonthISO()),
        supabase
          .from("chats")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("role", "user")
          .gte("timestamp", startOfCurrentMonthISO()),
      ]);

      setPlan(profile?.plan === "pro" ? "pro" : "free");
      setUploadsUsed(uploadCount ?? 0);
      setChatsUsed(chatCount ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade() {
    setActionLoading(true);
    const response = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setActionLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionLoading(true);
    const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Upgrade"
        description={
          plan === "pro"
            ? "You're on the Pro plan — thanks for supporting VoltIQX"
            : "See what changes with Pro, based on how you're actually using VoltIQX"
        }
      />

      {!loading && plan === "free" && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UsageStat label="Bill uploads this month" used={uploadsUsed} limit={FREE_TIER_UPLOAD_LIMIT} />
          <UsageStat label="AI Assistant messages this month" used={chatsUsed} limit={FREE_TIER_CHAT_LIMIT} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>What you're on today</CardDescription>
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
          {plan === "free" && (
            <CardFooter>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Your current plan
              </span>
            </CardFooter>
          )}
        </Card>

        <Card className="relative border-primary-300 shadow-glow dark:border-primary-800">
          {plan === "free" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                <Zap className="h-3 w-3" />
                Most popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>No monthly caps, ever</CardDescription>
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
            {plan === "pro" ? (
              <Button variant="outline" className="w-full" onClick={handleManageBilling} disabled={actionLoading}>
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Manage subscription
              </Button>
            ) : (
              <Button className="w-full" onClick={handleUpgrade} disabled={actionLoading || loading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Payments are processed securely by Stripe. VoltIQX never sees or stores your card details.
      </p>
    </div>
  );
}

function UsageStat({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = used >= limit;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className={isNearLimit ? "text-destructive" : "text-muted-foreground"}>
            {used} / {limit}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
