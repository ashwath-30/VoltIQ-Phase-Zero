"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartCard, chartColors } from "@/components/chart-card";
import { monthlyUsageHistory } from "@/lib/mock-data";
import type { MonthlyUsagePoint } from "@/types";

interface CarbonEmissionsChartProps {
  months?: number;
  data?: MonthlyUsagePoint[];
}

export function CarbonEmissionsChart({ months = 6, data: providedData }: CarbonEmissionsChartProps) {
  const source = providedData ?? monthlyUsageHistory;
  const data = source.slice(-months);

  return (
    <ChartCard title="Carbon Emissions" description="Estimated CO₂ output based on your grid's energy mix" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}kg`} />
        <Tooltip
          formatter={(value: number) => [`${value} kg CO₂`, "Emissions"]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Area
          type="monotone"
          dataKey="carbonKg"
          stroke={chartColors.primary}
          strokeWidth={2.5}
          fill="url(#carbonGradient)"
        />
      </AreaChart>
    </ChartCard>
  );
}
