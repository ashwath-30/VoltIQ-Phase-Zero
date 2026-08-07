"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ReportFilterTabs } from "@/components/reports/report-filter-tabs";
import { ReportRow } from "@/components/reports/report-row";
import { EmptyState, TableSkeleton } from "@/components/states";
import { createClient } from "@/lib/supabase/client";
import { mapDbBillToBill } from "@/lib/bills";
import { computeForecast, computeEnergyHealthScore, type ForecastResult, type ComputedHealthScore } from "@/lib/energy-model";
import { generateRecommendations, type GeneratedRecommendation } from "@/lib/recommendation-engine";
import { generateMonthlyAuditPdf } from "@/lib/generate-report-pdf";
import { generateAnnualSummaryPdf } from "@/lib/generate-annual-summary-pdf";
import { generateForecastReportPdf } from "@/lib/generate-forecast-report-pdf";
import { generateEfficiencyReportPdf } from "@/lib/generate-efficiency-report-pdf";
import type { ReportItem, Bill } from "@/types";

interface ProfileInfo {
  name?: string;
  address?: string;
  utilityProvider?: string;
  hasSolar?: boolean;
  hasBattery?: boolean;
  hasEv?: boolean;
}

// All four report types are real now:
// - Monthly Audit: one per processed bill
// - Annual Summary: one per calendar year that has at least one bill
// - Forecast Report: a single, always-current report (if a forecast can be computed)
// - Efficiency Report: a single, always-current report (if a health score can be computed)
export default function ReportsPage() {
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [profile, setProfile] = useState<ProfileInfo>({});
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [healthScore, setHealthScore] = useState<ComputedHealthScore | null>(null);
  const [recommendations, setRecommendations] = useState<GeneratedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileRow }, { data: billRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("bills").select("*").order("upload_date", { ascending: false }),
      ]);

      const realBills = (billRows ?? []).map(mapDbBillToBill).filter((b) => b.status === "processed");
      setBills(realBills);

      const profileInfo: ProfileInfo = {
        name: profileRow?.name,
        address: profileRow?.address,
        utilityProvider: profileRow?.utility_provider,
        hasSolar: !!profileRow?.has_solar,
        hasBattery: !!profileRow?.has_battery,
        hasEv: !!profileRow?.has_ev,
      };
      setProfile(profileInfo);

      const derivedReports: ReportItem[] = [];

      // Monthly Audit — one per real bill
      for (const bill of realBills) {
        derivedReports.push({
          id: bill.id,
          type: "monthly-audit",
          title: `${bill.billingPeriodLabel} Monthly Audit`,
          status: "ready",
          date: bill.uploadDate,
          sizeKb: 0,
        });
      }

      // Annual Summary — one per calendar year with at least one bill
      const years = Array.from(new Set(realBills.map((b) => b.billingPeriod.slice(0, 4)))).sort();
      for (const year of years) {
        const billsInYear = realBills.filter((b) => b.billingPeriod.startsWith(year));
        const latestInYear = [...billsInYear].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))[0];
        derivedReports.push({
          id: `annual-${year}`,
          type: "annual-summary",
          title: `${year} Annual Summary`,
          status: "ready",
          date: latestInYear.uploadDate,
          sizeKb: 0,
        });
      }

      let computedForecast: ForecastResult | null = null;
      let computedHealthScore: ComputedHealthScore | null = null;
      let computedRecommendations: GeneratedRecommendation[] = [];

      if (realBills.length > 0) {
        computedForecast = computeForecast(realBills);
        computedHealthScore = computeEnergyHealthScore(realBills);
        computedRecommendations = generateRecommendations(realBills, {
          hasSolar: profileInfo.hasSolar ?? false,
          hasBattery: profileInfo.hasBattery ?? false,
          hasEv: profileInfo.hasEv ?? false,
        });

        setForecast(computedForecast);
        setHealthScore(computedHealthScore);
        setRecommendations(computedRecommendations);

        const today = new Date().toISOString();

        if (computedForecast) {
          derivedReports.push({
            id: "forecast-current",
            type: "forecast",
            title: "Forecast Report",
            status: "ready",
            date: today,
            sizeKb: 0,
          });
        }

        if (computedHealthScore) {
          derivedReports.push({
            id: "efficiency-current",
            type: "efficiency",
            title: "Efficiency Report",
            status: "ready",
            date: today,
            sizeKb: 0,
          });
        }
      }

      setReports(derivedReports);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.type === filter)),
    [filter, reports]
  );

  function getDownloadHandler(report: ReportItem): (() => void) | undefined {
    if (report.type === "monthly-audit") {
      const bill = bills.find((b) => b.id === report.id);
      if (!bill) return undefined;
      return () => generateMonthlyAuditPdf(bill, profile);
    }

    if (report.type === "annual-summary") {
      const year = report.id.replace("annual-", "");
      const billsInYear = bills.filter((b) => b.billingPeriod.startsWith(year));
      if (billsInYear.length === 0) return undefined;
      return () => generateAnnualSummaryPdf(year, billsInYear, profile);
    }

    if (report.type === "forecast") {
      if (!forecast || bills.length === 0) return undefined;
      return () => generateForecastReportPdf(bills, forecast, profile);
    }

    if (report.type === "efficiency") {
      if (!healthScore || bills.length === 0) return undefined;
      const avgMonthlyBill = bills.reduce((sum, b) => sum + b.totalCost, 0) / bills.length;
      return () => generateEfficiencyReportPdf(healthScore, recommendations, avgMonthlyBill, profile);
    }

    return undefined;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Real, downloadable reports — Monthly Audits, Annual Summaries, and current Forecast and Efficiency reports"
      />

      <ReportFilterTabs value={filter} onChange={setFilter} />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={3} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No reports yet"
              description="Upload a bill and a downloadable Monthly Audit will appear here automatically, along with an Annual Summary, Forecast Report, and Efficiency Report."
            />
          ) : (
            <div className="flex flex-col">
              {filtered.map((report) => (
                <ReportRow key={report.id} report={report} onDownload={getDownloadHandler(report)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
