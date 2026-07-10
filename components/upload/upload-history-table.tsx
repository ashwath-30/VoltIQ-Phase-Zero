import { FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatKwh } from "@/lib/utils";
import { EmptyState, TableSkeleton } from "@/components/states";
import type { Bill } from "@/types";

const statusVariant = {
  processed: "success",
  processing: "warning",
  error: "destructive",
} as const;

interface UploadHistoryTableProps {
  bills: Bill[];
  loading?: boolean;
}

export function UploadHistoryTable({ bills, loading }: UploadHistoryTableProps) {
  if (loading) {
    return <TableSkeleton rows={3} />;
  }

  if (bills.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No bills uploaded yet"
        description="Upload your first bill above to start building your usage history."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Billing Period</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{bill.billingPeriodLabel}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{formatCurrency(bill.totalCost)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatKwh(bill.totalKwh)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[bill.status]} className="capitalize">
                    {bill.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(bill.uploadDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" aria-label="Download original bill">
                    <Download className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
