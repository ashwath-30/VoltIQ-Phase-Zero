const stats = [
  { value: "18%", label: "Average bill reduction reported by early users" },
  { value: "3 min", label: "To upload a bill and see your full breakdown" },
  { value: "86%", label: "Forecast confidence on next month's bill" },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Stop guessing why your bill went up
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most homeowners find out their bill spiked a month too late, with no idea why. VoltIQ breaks
              usage down by appliance, flags anomalies as they happen, and shows you the exact behavior
              or upgrade that would lower your next bill — before you're surprised by it again.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 text-center shadow-soft md:text-left"
              >
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
