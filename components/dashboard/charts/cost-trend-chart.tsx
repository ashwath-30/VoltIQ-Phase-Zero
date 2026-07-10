"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { ChartCard, chartColors } from "@/components/chart-card";
import { monthlyUsageHistory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyUsagePoint } from "@/types";

export function CostTrendChart({ data: providedData }: { data?: MonthlyUsagePoint[] }) {
  const data = providedData ?? monthlyUsageHistory;
  const avgWindow = data.slice(-6);
  const sixMoAvg = avgWindow.reduce((sum, m) => sum + m.cost, 0) / avgWindow.length;

  return (
    <ChartCard
      title="Cost Trends"
      description="This year against your own 6-month average — not just a snapshot"
    >
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Cost"]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <ReferenceLine
          y={sixMoAvg}
          stroke={chartColors.muted}
          strokeDasharray="4 4"
          label={{
            value: "Your 6-mo avg",
            position: "insideTopRight",
            fontSize: 11,
            fill: chartColors.muted,
          }}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke={chartColors.primary}
          strokeWidth={2.5}
          dot={{ r: 3, fill: chartColors.primary }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartCard>
  );
}
