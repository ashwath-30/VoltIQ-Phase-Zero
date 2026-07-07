import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For getting your first bill analyzed.",
    features: [
      "1 utility account",
      "Bill upload & analysis",
      "Basic usage insights",
      "3 AI assistant chats / month",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "per month",
    description: "For homeowners serious about saving.",
    features: [
      "Unlimited utility accounts",
      "AI cost forecasting",
      "Personalized recommendations",
      "Unlimited AI assistant",
      "Rate-plan comparison",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Family",
    price: "$19",
    cadence: "per month",
    description: "For multiple homes and shared budgets.",
    features: [
      "Everything in Pro",
      "Up to 5 properties",
      "Shared household dashboard",
      "Priority support",
      "Downloadable savings reports",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple pricing that pays for itself
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start free. Upgrade when you&apos;re ready to unlock forecasting and
            personalized savings.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-card",
                tier.popular
                  ? "border-primary shadow-glow lg:-mt-4 lg:pb-10 lg:pt-8"
                  : "border-border"
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold text-foreground">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {tier.description}
              </p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.cadence}
                </span>
              </div>

              <ul className="mt-6 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <Link href="/register">{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
