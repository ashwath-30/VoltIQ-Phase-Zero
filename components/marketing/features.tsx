import { Upload, TrendingUp, Lightbulb, MessageSquareText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Upload & Auto-Analyze Bills",
    description:
      "Drop in a PDF of your utility bill and VoltIQ extracts your usage, cost, and billing history automatically — no manual entry.",
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Forecasting",
    description:
      "See next month's bill before it arrives, with confidence-scored predictions based on your actual usage patterns and season.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Recommendations",
    description:
      "Get specific, prioritized suggestions — from HVAC tune-ups to solar feasibility — ranked by real dollar savings potential.",
  },
  {
    icon: MessageSquareText,
    title: "Ask Your AI Energy Assistant",
    description:
      "Chat naturally about your bill: \"Why was this month higher?\" or \"Should I get a battery?\" — plain-English answers, backed by your data.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to take control of your energy costs
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform to upload, understand, forecast, and act — instead of squinting at a paper bill once a month.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow hover:shadow-raised">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
