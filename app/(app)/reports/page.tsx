"use client";

import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ReportFilterTabs } from "@/components/reports/report-filter-tabs";
import { ReportRow } from "@/components/reports/report-row";
import { EmptyState } from "@/components/states";
import { reports } from "@/lib/mock-data";

export default function ReportsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.type === filter)),
    [filter]
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Every report is generated from your tracked history — not a one-time snapshot"
      />

      <ReportFilterTabs value={filter} onChange={setFilter} />

      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No reports in this category"
              description="Try a different filter, or check back after your next bill upload."
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
