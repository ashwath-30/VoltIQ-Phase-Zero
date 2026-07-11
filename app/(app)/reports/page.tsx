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
import type { ReportItem } from "@/types";

// Each real, processed bill becomes one real "Monthly Audit" report entry.
// Annual Summary / Forecast / Efficiency report types don't have real
// generation logic built yet, so they simply won't appear until that
// exists — no fabricated entries standing in for them.
export default function ReportsPage() {
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: billRows } = await supabase
        .from("bills")
        .select("*")
        .order("upload_date", { ascending: false });

      const bills = (billRows ?? []).map(mapDbBillToBill).filter((b) => b.status === "processed");

      const derivedReports: ReportItem[] = bills.map((bill) => ({
        id: bill.id,
        type: "monthly-audit",
        title: `${bill.billingPeriodLabel} Monthly Audit`,
        status: "ready",
        date: bill.uploadDate,
        sizeKb: 0, // no real generated file yet — sizeKb intentionally omitted from display
      }));

      setReports(derivedReports);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.type === filter)),
    [filter, reports]
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Reports"
        description="One audit per real bill you've uploaded — not a one-time snapshot"
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
              description="Upload a bill and a Monthly Audit report will appear here automatically. Other report types (annual summaries, forecasts, efficiency reports) are coming in a future update."
            />
          ) : (
            <div className="flex flex-col">
              {filtered.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
