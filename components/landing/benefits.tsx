import { CheckCircle2 } from "lucide-react";

const stats = [
  { value: "$412", label: "Average yearly savings per household" },
  { value: "23%", label: "Typical reduction in monthly usage" },
  { value: "60 sec", label: "To analyze your first bill" },
  { value: "50k+", label: "Bills analyzed to date" },
];

const points = [
  "Spot billing errors and overcharges automatically",
  "Know the best time of day to run heavy appliances",
  "Compare rate plans and switch with confidence",
  "Track progress toward a lower bill month over month",
];

export function Benefits() {
  return (
    <section className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Real savings, backed by your own data
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              VoltIQ doesn&apos;t guess. It learns from your actual consumption
              and utility rates to find savings you can measure, and then helps
              you capture them.
            </p>

            <ul className="mt-8 flex flex-col gap-4">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
