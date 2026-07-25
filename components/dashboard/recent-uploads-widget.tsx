import Link from "next/link";
import { FileText, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { formatCurrency } from "@/lib/utils";
import type { Bill } from "@/types";

export function RecentUploadsWidget({ bills }: { bills: Bill[] }) {
  const recent = bills.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Recent Uploads</CardTitle>
          <CardDescription>
            {bills.length} {bills.length === 1 ? "bill" : "bills"} tracked so far — your history compounds over
            time
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/upload">
            Upload new
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className={recent.length === 0 ? undefined : "flex flex-col divide-y divide-border"}>
        {recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No bills uploaded yet"
            description="Upload your first bill to start building your history."
          />
        ) : (
          recent.map((bill) => (
            <div key={bill.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{bill.billingPeriodLabel}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(bill.totalCost)}</p>
              </div>
              {bill.status === "processed" ? (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Processed
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Error
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
