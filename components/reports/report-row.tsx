"use client";

import { useState } from "react";
import { FileText, CalendarRange, TrendingUp, Gauge, Download, Loader2, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReportItem, Bill } from "@/types";
import { generateMonthlyAuditPdf } from "@/lib/generate-report-pdf";

const typeConfig = {
  "monthly-audit": { icon: FileText, label: "Monthly Audit" },
  "annual-summary": { icon: CalendarRange, label: "Annual Summary" },
  forecast: { icon: TrendingUp, label: "Forecast Report" },
  efficiency: { icon: Gauge, label: "Efficiency Report" },
} as const;

const statusVariant = {
  ready: "success",
  generating: "warning",
  failed: "destructive",
} as const;

interface ReportRowProps {
  report: ReportItem;
  bill?: Bill;
  profile?: {
    name?: string;
    address?: string;
    utilityProvider?: string;
    hasSolar?: boolean;
    hasBattery?: boolean;
    hasEv?: boolean;
  };
}

export function ReportRow({ report, bill, profile }: ReportRowProps) {
  const [state, setState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const { icon: Icon, label } = typeConfig[report.type];
  const canDownload = report.status === "ready" && !!bill;

  async function handleDownload() {
    if (!bill || state === "generating") return;
    setState("generating");
    try {
      // Runs entirely in the browser — a brief tick lets the spinner
      // actually render before the (fast, synchronous) PDF build runs.
      await new Promise((resolve) => setTimeout(resolve, 150));
      generateMonthlyAuditPdf(bill, profile ?? {});
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    } catch (err) {
      console.error("PDF generation error:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-border py-4 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{report.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{label}</span>
          <span>·</span>
          <span>
            {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      <Badge variant={statusVariant[report.status]} className="capitalize">
        {report.status === "generating" && <Loader2 className="h-3 w-3 animate-spin" />}
        {report.status === "failed" && <AlertTriangle className="h-3 w-3" />}
        {report.status}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        disabled={!canDownload || state === "generating"}
        title={canDownload ? "Download PDF" : "Not available"}
        aria-label={`Download ${report.title}`}
      >
        {state === "generating" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="h-4 w-4 text-primary" />
        ) : state === "error" ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
