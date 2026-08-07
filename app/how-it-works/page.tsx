import { TrendingUp, Gauge, CloudSun, Lightbulb, Landmark, Users, PieChart, MessageCircle, Check, Sparkles, BookOpen } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type MethodologyKind = "real" | "ai-estimate" | "sourced";

const kindBadge: Record<MethodologyKind, { label: string; variant: "success" | "secondary" | "muted" }> = {
  real: { label: "Real statistical model", variant: "success" },
  "ai-estimate": { label: "AI estimate", variant: "secondary" },
  sourced: { label: "Government-sourced", variant: "muted" },
};

const methods: {
  icon: typeof TrendingUp;
  title: string;
  kind: MethodologyKind;
  description: string;
}[] = [
  {
    icon: TrendingUp,
    title: "Bill Forecasting",
    kind: "real",
    description:
      "A real linear regression fitted to your own bill history — not a fixed guess. The more bills you upload, the more data points inform the trend. Every forecast comes with a confidence score reflecting how much your own history actually supports it.",
  },
  {
    icon: Gauge,
    title: "Energy Health Score",
    kind: "real",
    description:
      "A 0-100 score built from three real, computed factors: your usage trend over time, how consistent your usage is month to month, and what share of your usage falls in peak-pricing hours. Not a black box — every factor is visible.",
  },
  {
    icon: CloudSun,
    title: "Weather-Adjusted Usage Analysis",
    kind: "real",
    description:
      "Using real historical weather data for your ZIP code, we run a degree-day regression — the same PRISM methodology (Fels, 1986) that utilities and energy-efficiency programs have used for decades — to separate how much of your bill was driven by hot or cold weather versus your actual baseline usage. This needs real weather data and enough bill history (at least 4 bills) to produce a meaningful result.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Recommendations",
    kind: "real",
    description:
      "Suggestions like shifting usage off-peak, or considering solar, are computed directly from your real bill history and home profile — not generic tips. Where a dollar estimate requires an assumption we can't fully verify (like your exact utility's time-of-use rates), we say so plainly in the recommendation itself, rather than presenting invented precision.",
  },
  {
    icon: Users,
    title: "Peer Comparison",
    kind: "real",
    description:
      "A real percentile comparing your usage to other VoltIQX homes of a similar size — computed as an aggregate statistic, never showing any individual user's data. Only shown once there are enough comparable homes for the comparison to actually mean something.",
  },
  {
    icon: Landmark,
    title: "Efficiency Tips",
    kind: "sourced",
    description:
      "A small set of real efficiency facts from the U.S. Department of Energy and ENERGY STAR — each one checked directly against the original government source before being added, not recalled from memory. These are general guidance, clearly labeled as such, and not personalized to your specific home.",
  },
  {
    icon: PieChart,
    title: "Appliance Breakdown",
    kind: "ai-estimate",
    description:
      "Honestly, this one is an estimate, not a measurement. Real per-appliance breakdown requires smart-meter hardware we don't have access to. Instead, we ask Claude (Anthropic's AI model) to produce a plausible breakdown from your real total, peak, and off-peak usage — clearly labeled \"AI Estimate\" everywhere it appears in the product, never presented as measured data.",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    kind: "ai-estimate",
    description:
      "Our AI Assistant is built on Claude and answers using your real account data — your actual bills, forecast, and health score are included in what it sees. It's a conversational AI system generating responses, not a separate statistical model — it's instructed to only reference verifiable real data, and to say so honestly when something isn't available yet, rather than invent an answer.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight">How VoltIQX actually works</h1>
            <p className="mt-4 text-muted-foreground">
              Every number in VoltIQX comes from somewhere real — your own bills, real weather data, a
              government source, or an AI estimate honestly labeled as one. This page explains exactly which
              is which, for every feature in the product.
            </p>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {methods.map((method) => {
              const Icon = method.icon;
              const badge = kindBadge[method.kind];
              return (
                <Card key={method.title}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{method.title}</CardTitle>
                    </div>
                    <Badge variant={badge.variant} className="shrink-0">
                      {badge.label}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      {method.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold">The honest summary</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Every feature in VoltIQX falls into exactly one of these three categories — nothing in between.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <Badge variant="success" className="w-fit">
                    <Check className="h-3 w-3" />
                    Real statistical models
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span>Bill Forecasting</span>
                  <span>Energy Health Score</span>
                  <span>Weather-Adjusted Analysis</span>
                  <span>Personalized Recommendations</span>
                  <span>Peer Comparison</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    <Sparkles className="h-3 w-3" />
                    AI estimates
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span>Appliance Breakdown</span>
                  <span>AI Assistant responses</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Badge variant="muted" className="w-fit">
                    <Landmark className="h-3 w-3" />
                    Government-sourced
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span>Efficiency Tips (DOE / ENERGY STAR)</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold">See it with your own data</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a bill and watch these real models compute something specific to your home.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
