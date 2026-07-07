import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 to-background" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered home energy audits
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Understand and cut your home electricity costs with AI
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            VoltIQ reads your utility bills, forecasts what you&apos;ll pay next
            month, and delivers personalized recommendations that put money back
            in your pocket, no smart meter required.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">
                <PlayCircle className="h-4 w-4" />
                See How It Works
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Cancel anytime
          </p>
        </div>

        {/* product screenshot */}
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-raised">
            <Image
              src="/images/dashboard-preview.png"
              alt="VoltIQ dashboard showing electricity usage trends, forecasted costs, and estimated annual savings"
              width={1600}
              height={1000}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
