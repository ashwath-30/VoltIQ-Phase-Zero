"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartCard, chartColors } from "@/components/chart-card";
import { monthlyUsageHistory } from "@/lib/mock-data";
import { formatKwh } from "@/lib/utils";
import type { MonthlyUsagePoint } from "@/types";

interface MonthlyUsageChartProps {
  months?: number;
  data?: MonthlyUsagePoint[];
}

export function MonthlyUsageChart({ months = 12, data: providedData }: MonthlyUsageChartProps) {
  const source = providedData ?? monthlyUsageHistory;
  const data = source.slice(-months);

  return (
    <ChartCard
      title="Monthly kWh Usage"
      description="Split by peak vs. off-peak hours"
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          formatter={(value: number, name: string) => [formatKwh(value), name]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="peak" name="Peak" stackId="usage" fill={chartColors.secondary} radius={[0, 0, 0, 0]} />
        <Bar
          dataKey="offPeak"
          name="Off-Peak"
          stackId="usage"
          fill={chartColors.secondaryLight}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartCard>
  );
}
