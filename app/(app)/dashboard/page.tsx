"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EnergyHealthScoreWidget } from "@/components/dashboard/energy-health-score-card";
import { RecommendationsWidget } from "@/components/dashboard/recommendations-widget";
import { RecentUploadsWidget } from "@/components/dashboard/recent-uploads-widget";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { MonthlyCostChart } from "@/components/dashboard/charts/monthly-cost-chart";
import { MonthlyUsageChart } from "@/components/dashboard/charts/monthly-usage-chart";
import { CostTrendChart } from "@/components/dashboard/charts/cost-trend-chart";
import { ForecastedBillChart } from "@/components/dashboard/charts/forecasted-bill-chart";
import { CardSkeleton, ChartSkeleton, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapDbBillToBill, billsToMonthlyPoints } from "@/lib/bills";
import { computeForecast, computeEnergyHealthScore, type ForecastResult, type ComputedHealthScore } from "@/lib/energy-model";
import { getPeerComparison, type PeerComparisonResult } from "@/lib/peer-comparison";
import { generateRecommendations, type GeneratedRecommendation } from "@/lib/recommendation-engine";
import type { Bill, NotificationItem } from "@/types";

function mapNotificationRow(row: Record<string, any>): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    read: row.read,
    severity: row.severity,
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [homeSize, setHomeSize] = useState(0);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [healthScore, setHealthScore] = useState<ComputedHealthScore | null>(null);
  const [peerComparison, setPeerComparison] = useState<PeerComparisonResult | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recommendations, setRecommendations] = useState<GeneratedRecommendation[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: billRows }, { data: notifRows }] = await Promise.all([
        supabase.from("profiles").select("name, home_size, has_solar, has_battery, has_ev").eq("id", user.id).single(),
        supabase.from("bills").select("*").order("upload_date", { ascending: false }),
        supabase.from("notifications").select("*").order("timestamp", { ascending: false }),
      ]);

      const realBills = (billRows ?? []).map(mapDbBillToBill).filter((b) => b.status === "processed");
      setBills(realBills);
      setNotifications((notifRows ?? []).map(mapNotificationRow));
      setFirstName((profile?.name || user.email || "there").split(" ")[0]);
      setHomeSize(profile?.home_size ?? 0);
      setRecommendations(
        generateRecommendations(realBills, {
          hasSolar: !!profile?.has_solar,
          hasBattery: !!profile?.has_battery,
          hasEv: !!profile?.has_ev,
        })
      );

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
      <div>
        <PageHeader title="Welcome back" description="Loading your dashboard..." />
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div>
        <PageHeader title={`Welcome, ${firstName}`} description="Let's get your first bill in" />
        <EmptyState
          icon={Sparkles}
          title="Your dashboard is ready — it just needs a bill"
          description="Every chart, forecast, and score on this page is computed from your real bill history. Upload your first one to see it come to life."
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
  const currentBill = [...bills].sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))[0];
  const profileComplete = homeSize > 0;

  return (
    <div>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's what's changed since your last visit" />

      <div className="flex flex-col gap-6">
        <SummaryCards
          currentBill={currentBill}
          monthlyPoints={monthlyPoints}
          healthScore={healthScore}
          recommendations={recommendations}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <EnergyHealthScoreWidget
              healthScore={healthScore}
              peerComparison={peerComparison}
              profileComplete={profileComplete}
            />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <RecommendationsWidget recommendations={recommendations} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <RecentUploadsWidget bills={bills} />
              <NotificationsWidget notifications={notifications} />
            </div>
          </div>
        </div>

        {forecast && <ForecastedBillChart currentBill={currentBill} forecast={forecast} />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MonthlyCostChart data={monthlyPoints} months={monthlyPoints.length} />
          <MonthlyUsageChart data={monthlyPoints} months={monthlyPoints.length} />
        </div>

        <CostTrendChart data={monthlyPoints} />
      </div>
    </div>
  );
}
