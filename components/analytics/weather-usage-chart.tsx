"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartCard } from "@/components/chart-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { formatKwh } from "@/lib/utils";
import { CloudSun } from "lucide-react";
import type { UsageSplit } from "@/lib/weather-regression";

export interface WeatherInsightCache {
  splits: UsageSplit[];
  rSquared: number;
  computedAt: string;
}

interface WeatherUsageChartProps {
  cache: WeatherInsightCache | null | undefined;
}

export function WeatherUsageChart({ cache }: WeatherUsageChartProps) {
  if (!cache || cache.splits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weather-Adjusted Usage</CardTitle>
          <CardDescription>Real degree-day regression — separates weather-driven usage from baseline</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CloudSun}
            title="Not computed yet"
            description="This needs a saved ZIP code and at least 4 processed bills. It updates once a day automatically — check back after your next few bill uploads."
          />
        </CardContent>
      </Card>
    );
  }

  const data = cache.splits.map((s) => ({
    period: s.billingPeriod,
    Baseline: s.baselineKwh,
    "Weather-driven": s.weatherKwh,
  }));

  const computedDate = new Date(cache.computedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <ChartCard
      title="Weather-Adjusted Usage"
      description={`Real degree-day regression (R² ${cache.rSquared.toFixed(2)}) — last computed ${computedDate}`}
      height={300}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatKwh(v)} />
        <Tooltip
          formatter={(value: number) => formatKwh(value)}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Baseline" stackId="usage" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
        <Bar dataKey="Weather-driven" stackId="usage" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
