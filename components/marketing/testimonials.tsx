import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "I finally understand what's actually driving my bill instead of just staring at a scary total every month.",
    name: "Priya M.",
    location: "Austin, TX",
  },
  {
    quote:
      "The forecast has been shockingly accurate two months in a row. It even flagged my AC before it started acting up.",
    name: "Daniel K.",
    location: "Phoenix, AZ",
  },
  {
    quote:
      "Asked the assistant if solar was worth it for my house and got a straight, useful answer instead of a sales pitch.",
    name: "Sam R.",
    location: "Denver, CO",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Homeowners are already saving with VoltIQ
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
