"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartCard } from "@/components/chart-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { formatKwh } from "@/lib/utils";
import { Sparkles, PieChart as PieIcon } from "lucide-react";

const sliceColors = ["#10B981", "#3B82F6", "#6EE7B7", "#93C5FD", "#F59E0B", "#A78BFA", "#94A3B8"];

interface ApplianceBreakdownChartProps {
  data: { name: string; kwh: number }[] | null;
  loading?: boolean;
}

export function ApplianceBreakdownChart({ data, loading }: ApplianceBreakdownChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appliance Energy Breakdown</CardTitle>
          <CardDescription>AI estimate from your bill data</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={PieIcon}
            title="Couldn't generate an estimate"
            description="This needs at least one processed bill. Try again after your next upload, or refresh this page."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <ChartCard
      title="Appliance Energy Breakdown"
      description="AI estimate from your real usage data — not measured per-appliance, since that needs metering hardware we don't have"
      height={300}
      action={
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Estimate
        </Badge>
      }
    >
      <PieChart>
        <Pie data={data} dataKey="kwh" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((entry, i) => (
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
