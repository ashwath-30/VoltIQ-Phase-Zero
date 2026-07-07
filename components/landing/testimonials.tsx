import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "VoltIQ caught that I was on the wrong rate plan. Switching saved me almost $40 a month, it paid for itself in a day.",
    name: "Marcus Reyes",
    location: "Austin, TX",
  },
  {
    quote:
      "The forecast is scary accurate. I finally know what my bill will be before it arrives and can plan around it.",
    name: "Priya Nair",
    location: "Portland, OR",
  },
  {
    quote:
      "I just uploaded my bill and asked questions like I was texting a friend. It found savings I never would have spotted.",
    name: "Danielle Foster",
    location: "Columbus, OH",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Homeowners are already saving
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Join thousands who stopped overpaying for electricity.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
