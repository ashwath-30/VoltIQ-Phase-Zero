import { TrendingDown, TrendingUp, Users, CalendarClock, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Bill } from "@/types";
import type { ComputedHealthScore } from "@/lib/energy-model";
import type { PeerComparisonResult } from "@/lib/peer-comparison";

interface ComparisonCardsProps {
  currentBill: Bill;
  previousBill?: Bill;
  healthScore: ComputedHealthScore | null;
  peerComparison: PeerComparisonResult | null;
  profileComplete: boolean;
}

export function ComparisonCards({
  currentBill,
  previousBill,
  healthScore,
  peerComparison,
  profileComplete,
}: ComparisonCardsProps) {
  const monthOverMonth = previousBill
    ? ((currentBill.totalCost - previousBill.totalCost) / previousBill.totalCost) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ComparisonCard
        icon={CalendarClock}
        label="vs. Last Month"
        value={previousBill ? `${monthOverMonth > 0 ? "+" : ""}${monthOverMonth.toFixed(1)}%` : "—"}
        good={monthOverMonth < 0}
        note={
          previousBill
            ? `${previousBill.billingPeriodLabel} → ${currentBill.billingPeriodLabel}`
            : "Upload another bill to compare"
        }
      />
      <ComparisonCard
        icon={
          !healthScore ? HelpCircle : healthScore.trend === "improving" ? TrendingDown : TrendingUp
        }
        label="Your Trend"
        value={
          healthScore
            ? `${healthScore.trendDeltaPoints > 0 ? "+" : ""}${healthScore.trendDeltaPoints} pts`
            : "—"
        }
        good={healthScore?.trend === "improving"}
        note="Energy Health Score, month over month"
      />
      <ComparisonCard
        icon={Users}
        label="vs. Similar Homes"
        value={
          !profileComplete
            ? "—"
            : peerComparison && peerComparison.percentile !== null
            ? `Top ${100 - peerComparison.percentile}%`
            : "—"
        }
        good={!!peerComparison && peerComparison.percentile !== null && peerComparison.percentile >= 50}
        note={
          !profileComplete
            ? "Add your home size in Profile to unlock this"
            : peerComparison && peerComparison.percentile !== null
            ? `Better than ${peerComparison.percentile}% of ${peerComparison.comparableHomes} similar-sized homes`
            : "Not enough similar homes on VoltIQ yet"
        }
        highlight
      />
    </div>
  );
}

function ComparisonCard({
  icon: Icon,
  label,
  value,
  good,
  note,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  good: boolean;
  note: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-secondary-200 dark:border-secondary-900")}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={cn("h-4 w-4", good ? "text-primary" : "text-muted-foreground")} />
        </div>
        <p className={cn("mt-1 font-display text-2xl font-bold", good ? "text-primary" : "text-foreground")}>
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
