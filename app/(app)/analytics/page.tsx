"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { AnalyticsFilterBar } from "@/components/analytics/filter-bar";
import { ComparisonCards } from "@/components/analytics/comparison-cards";
import { ApplianceBreakdownChart } from "@/components/analytics/appliance-breakdown-chart";
import { PeakOffPeakChart } from "@/components/analytics/peak-offpeak-chart";
import { CarbonEmissionsChart } from "@/components/analytics/carbon-emissions-chart";
import { SavingsOpportunitiesList } from "@/components/analytics/savings-opportunities-list";
import { MonthlyCostChart } from "@/components/dashboard/charts/monthly-cost-chart";
import { MonthlyUsageChart } from "@/components/dashboard/charts/monthly-usage-chart";
import { CostTrendChart } from "@/components/dashboard/charts/cost-trend-chart";
import { ForecastedBillChart } from "@/components/dashboard/charts/forecasted-bill-chart";

export default function AnalyticsPage() {
  const [range, setRange] = useState("6");
  const months = parseInt(range, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="A deeper look at your usage, benchmarked against your own history and similar homes"
      />

      <AnalyticsFilterBar range={range} onRangeChange={setRange} />

      <ComparisonCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyCostChart months={months} />
        <MonthlyUsageChart months={months} />
      </div>

      <CostTrendChart />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ApplianceBreakdownChart />
        <PeakOffPeakChart months={months} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CarbonEmissionsChart months={months} />
        <ForecastedBillChart />
      </div>

      <SavingsOpportunitiesList />
    </div>
  );
}
