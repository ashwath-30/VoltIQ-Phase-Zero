"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartCard, chartColors } from "@/components/chart-card";
import { monthlyUsageHistory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyUsagePoint } from "@/types";

interface MonthlyCostChartProps {
  months?: number;
  data?: MonthlyUsagePoint[]; // pass real bill-derived data; omit to use mock data
}

export function MonthlyCostChart({ months = 12, data: providedData }: MonthlyCostChartProps) {
  const source = providedData ?? monthlyUsageHistory;
  const data = source.slice(-months);
  const lastIndex = data.length - 1;

  return (
    <ChartCard title="Monthly Electricity Cost" description="Current month highlighted">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Cost"]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === lastIndex ? chartColors.primary : chartColors.primaryLight} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
