import { Zap, Target, Users, ShieldCheck } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const values = [
  {
    icon: Target,
    title: "Clarity over complexity",
    description:
      "Utility bills are confusing by default. Every part of VoltIQX is built to make your energy usage make sense at a glance.",
  },
  {
    icon: Users,
    title: "Built around your home, not a generic average",
    description:
      "Your recommendations, forecasts, and score are shaped by your actual usage history and home profile — not one-size-fits-all advice.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    description:
      "We don't sell your data. You can request a copy or delete your account at any time from Settings.",
  },
];

export default function AboutPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300">
            <Zap className="h-3.5 w-3.5" />
            About VoltIQX
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Understanding your electricity bill shouldn't require an engineering degree
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            VoltIQX started from a simple frustration: utility bills are full of numbers — kWh, peak vs.
            off-peak, tiered rates — but almost none of the context that actually explains why your bill
            looks the way it does, or what to do about it. Anyone can paste a bill into a general AI
            chatbot and get a one-off guess. We wanted something that actually remembers your home,
            tracks your usage over time, and gets more useful with every bill you upload — not a
            conversation that starts over from zero each time.
          </p>

          <p className="mt-4 text-lg text-muted-foreground">
            We're a small team building VoltIQX because we believe homeowners deserve the same level of
            insight utilities and energy companies already have about them — just pointed in their
            direction for once.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
