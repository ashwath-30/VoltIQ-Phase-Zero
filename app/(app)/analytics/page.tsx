"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
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
import { EmptyState, ChartSkeleton, CardSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapDbBillToBill, billsToMonthlyPoints } from "@/lib/bills";
import { computeForecast, computeEnergyHealthScore, type ForecastResult, type ComputedHealthScore } from "@/lib/energy-model";
import { getPeerComparison, type PeerComparisonResult } from "@/lib/peer-comparison";
import type { Bill } from "@/types";

export default function AnalyticsPage() {
  const [range, setRange] = useState("6");
  const months = parseInt(range, 10);

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [homeSize, setHomeSize] = useState(0);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [healthScore, setHealthScore] = useState<ComputedHealthScore | null>(null);
  const [peerComparison, setPeerComparison] = useState<PeerComparisonResult | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: billRows }] = await Promise.all([
        supabase.from("profiles").select("home_size").eq("id", user.id).single(),
        supabase.from("bills").select("*").order("upload_date", { ascending: false }),
      ]);

      const realBills = (billRows ?? []).map(mapDbBillToBill).filter((b) => b.status === "processed");
      setBills(realBills);
      setHomeSize(profile?.home_size ?? 0);

      if (realBills.length > 0) {
        setForecast(computeForecast(realBills));
        setHealthScore(computeEnergyHealthScore(realBills));

        const latestBill = [...realBills].sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))[0];
        if (profile?.home_size) {
          const peer = await getPeerComparison(profile.home_size, latestBill.totalKwh);
          setPeerComparison(peer);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics" description="Loading your data..." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" description="A deeper look at your usage" />
        <EmptyState
          icon={Sparkles}
          title="Nothing to analyze yet"
          description="Every chart here is computed from your real bill history. Upload your first bill to see it come to life."
          className="py-16"
        />
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link href="/upload">Upload a bill</Link>
          </Button>
        </div>
      </div>
    );
  }

  const monthlyPoints = billsToMonthlyPoints(bills);
  const sortedByPeriod = [...bills].sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod));
  const currentBill = sortedByPeriod[0];
  const previousBill = sortedByPeriod[1];
  const profileComplete = homeSize > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="A deeper look at your usage, benchmarked against your own history and similar homes"
      />

      <AnalyticsFilterBar range={range} onRangeChange={setRange} />

      <ComparisonCards
        currentBill={currentBill}
        previousBill={previousBill}
        healthScore={healthScore}
        peerComparison={peerComparison}
        profileComplete={profileComplete}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyCostChart data={monthlyPoints} months={months} />
        <MonthlyUsageChart data={monthlyPoints} months={months} />
      </div>

      <CostTrendChart data={monthlyPoints} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ApplianceBreakdownChart />
        <PeakOffPeakChart data={monthlyPoints} months={months} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CarbonEmissionsChart data={monthlyPoints} months={months} />
        {forecast && <ForecastedBillChart currentBill={currentBill} forecast={forecast} />}
      </div>

      <SavingsOpportunitiesList />
    </div>
  );
}
