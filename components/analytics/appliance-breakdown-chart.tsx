"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartCard } from "@/components/chart-card";
import { applianceBreakdown } from "@/lib/mock-data";
import { formatKwh } from "@/lib/utils";

const sliceColors = [
  "#10B981",
  "#3B82F6",
  "#6EE7B7",
  "#93C5FD",
  "#F59E0B",
  "#A78BFA",
  "#94A3B8",
];

export function ApplianceBreakdownChart() {
  return (
    <ChartCard
      title="Appliance Energy Breakdown"
      description="Estimated via usage disaggregation, not a manual guess"
      height={300}
    >
      <PieChart>
        <Pie
          data={applianceBreakdown}
          dataKey="kwh"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {applianceBreakdown.map((entry, i) => (
            <Cell key={entry.name} fill={sliceColors[i % sliceColors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatKwh(value), name]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, lineHeight: "1.8em" }}
        />
      </PieChart>
    </ChartCard>
  );
}
