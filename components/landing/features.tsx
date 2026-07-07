import { FileText, LineChart, Lightbulb, MessageSquare } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Bill upload & analysis",
    description:
      "Snap a photo or upload a PDF of your utility bill. VoltIQ instantly extracts your usage, rate plan, and hidden fees, no manual entry.",
  },
  {
    icon: LineChart,
    title: "AI cost forecasting",
    description:
      "Machine learning models trained on seasonal patterns predict next month's bill so surprises never hit your budget again.",
  },
  {
    icon: Lightbulb,
    title: "Personalized recommendations",
    description:
      "Get a prioritized action plan tailored to your home, from rate-plan switches to appliance timing, ranked by real dollar impact.",
  },
  {
    icon: MessageSquare,
    title: "AI chat assistant",
    description:
      "Ask anything about your energy use in plain English. Your assistant knows your bills and answers with specifics, not generic tips.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to master your energy bill
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Four intelligent tools that turn confusing utility statements into a
            clear plan to spend less.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-raised"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
