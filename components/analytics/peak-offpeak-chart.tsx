"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartCard, chartColors } from "@/components/chart-card";
import { monthlyUsageHistory } from "@/lib/mock-data";
import { formatKwh } from "@/lib/utils";

export function PeakOffPeakChart({ months = 6 }: { months?: number }) {
  const recent = monthlyUsageHistory.slice(-months);
  const peakTotal = recent.reduce((sum, m) => sum + m.peak, 0);
  const offPeakTotal = recent.reduce((sum, m) => sum + m.offPeak, 0);
  const total = peakTotal + offPeakTotal;
  const peakPercent = Math.round((peakTotal / total) * 100);

  const data = [
    { name: "Peak Hours", value: peakTotal },
    { name: "Off-Peak Hours", value: offPeakTotal },
  ];

  return (
    <ChartCard
      title="Peak vs. Off-Peak Usage"
      description={`${peakPercent}% of your usage falls in peak hours — shifting more to off-peak lowers cost per kWh`}
      height={260}
    >
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          <Cell fill={chartColors.secondary} />
          <Cell fill={chartColors.primaryLight} />
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatKwh(value), name]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
      </PieChart>
    </ChartCard>
  );
}
