"use client";

import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartCard, chartColors } from "@/components/chart-card";
import { Badge } from "@/components/ui/badge";
import { bills, latestForecast } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Bill } from "@/types";
import type { ForecastResult } from "@/lib/energy-model";

interface ForecastedBillChartProps {
  currentBill?: Bill;
  forecast?: ForecastResult;
}

export function ForecastedBillChart({ currentBill: providedBill, forecast: providedForecast }: ForecastedBillChartProps) {
  const currentBill = providedBill ?? bills[0];
  const predictedCost = providedForecast?.predictedCost ?? latestForecast.predictedCost;
  const confidence = providedForecast?.confidence ?? latestForecast.confidence;
  const forecastLabel = providedForecast ? `${providedForecast.periodLabel} (forecast)` : "Next month (forecast)";

  const data = [
    { label: currentBill.billingPeriodLabel, cost: currentBill.totalCost, kind: "actual" },
    { label: forecastLabel, cost: predictedCost, kind: "forecast" },
  ];

  const confidencePercent = Math.round(confidence * 100);
  const confidenceLabel =
    confidencePercent >= 80 ? "success" : confidencePercent >= 60 ? "warning" : "muted";

  return (
    <ChartCard
      title="Forecasted Bill"
      description="Predicted from your usage pattern, with a calibrated confidence score"
      action={
        <Badge variant={confidenceLabel} className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {confidencePercent}% confidence
        </Badge>
      }
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Cost"]}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
        />
        <Bar dataKey="cost" radius={[6, 6, 0, 0]} barSize={64}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.kind === "forecast" ? chartColors.secondary : chartColors.primary} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
