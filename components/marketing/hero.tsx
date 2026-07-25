"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300"
        >
          <Zap className="h-3.5 w-3.5" />
          AI-powered energy insights for your home
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-balance font-display text-4xl font-bold tracking-tight md:text-6xl"
        >
          Understand your electricity bill{" "}
          <span className="text-primary">before it surprises you</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          VoltIQX analyzes your utility bills, forecasts what you'll pay next month,
          and tells you exactly what to change to lower it — all in plain English.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
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
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative mx-auto mt-16 max-w-5xl"
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-raised">
          <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/40 dark:to-secondary-950/40">
            <ProductPreviewIllustration />
          </div>
        </div>
        {/* soft glow accent behind the preview */}
        <div className="pointer-events-none absolute inset-x-12 -top-6 -z-10 h-24 rounded-full bg-primary/20 blur-3xl" />
      </motion.div>
    </section>
  );
}

function ProductPreviewIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="h-3/4 w-3/4 max-w-lg" fill="none">
      <rect x="20" y="20" width="360" height="180" rx="12" className="fill-card stroke-border" strokeWidth="1.5" />
      <rect x="40" y="40" width="90" height="50" rx="8" className="fill-primary-100 dark:fill-primary-900/40" />
      <rect x="140" y="40" width="90" height="50" rx="8" className="fill-secondary-100 dark:fill-secondary-900/40" />
      <rect x="240" y="40" width="120" height="50" rx="8" className="fill-muted" />
      <polyline
        points="40,150 90,130 140,145 190,110 240,120 290,90 340,100"
        className="stroke-primary"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        strokeDasharray={1000}
        style={{ animation: "pulse-line 2s ease-out forwards" }}
      />
      <circle cx="340" cy="100" r="4" className="fill-primary" />
    </svg>
  );
}
