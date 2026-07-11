import { DollarSign, Zap, Leaf, Gauge, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatKwh } from "@/lib/utils";
import type { Bill, MonthlyUsagePoint } from "@/types";
import type { ComputedHealthScore } from "@/lib/energy-model";
import type { GeneratedRecommendation } from "@/lib/recommendation-engine";

// Framed as "vs your own average," not just a raw number — this
// comparison only exists because VoltIQ has your usage history. A
// one-off "paste your bill into a chatbot" session has no baseline to
// compare against. Averages over whatever history exists (up to 6
// months), rather than assuming a full 6 months are always available.
function recentAverage(points: MonthlyUsagePoint[], key: "cost" | "kwh" | "carbonKg") {
  const recent = points.slice(-6);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, m) => sum + m[key], 0) / recent.length;
}

interface SummaryCardsProps {
  currentBill: Bill;
  monthlyPoints: MonthlyUsagePoint[];
  healthScore: ComputedHealthScore | null;
  recommendations: GeneratedRecommendation[];
}

export function SummaryCards({ currentBill, monthlyPoints, healthScore, recommendations }: SummaryCardsProps) {
  const avgCost = recentAverage(monthlyPoints, "cost");
  const avgKwh = recentAverage(monthlyPoints, "kwh");
  const avgCarbon = recentAverage(monthlyPoints, "carbonKg");
  const currentCarbon = Math.round(currentBill.totalKwh * 0.42);

  const costDelta = avgCost > 0 ? ((currentBill.totalCost - avgCost) / avgCost) * 100 : 0;
  const kwhDelta = avgKwh > 0 ? ((currentBill.totalKwh - avgKwh) / avgKwh) * 100 : 0;
  const carbonDelta = avgCarbon > 0 ? ((currentCarbon - avgCarbon) / avgCarbon) * 100 : 0;
  const hasBaseline = monthlyPoints.length > 1;

  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard
        icon={DollarSign}
        label="Current Monthly Bill"
        value={formatCurrency(currentBill.totalCost)}
        delta={hasBaseline ? costDelta : undefined}
        deltaLabel="vs your recent avg"
        staticNote={hasBaseline ? undefined : "upload more bills for a trend"}
        invertGood
      />
      <SummaryCard
        icon={PiggyBank}
        label="Estimated Savings"
        value={formatCurrency(totalPotentialSavings)}
        deltaLabel="available this month"
        staticNote="from active recommendations"
      />
      <SummaryCard
        icon={Zap}
        label="Total Energy Usage"
        value={formatKwh(currentBill.totalKwh)}
        delta={hasBaseline ? kwhDelta : undefined}
        deltaLabel="vs your recent avg"
        staticNote={hasBaseline ? undefined : "upload more bills for a trend"}
        invertGood
      />
      <SummaryCard
        icon={Leaf}
        label="Carbon Footprint"
        value={`${currentCarbon} kg CO₂`}
        delta={hasBaseline ? carbonDelta : undefined}
        deltaLabel="vs your recent avg"
        staticNote={hasBaseline ? undefined : "upload more bills for a trend"}
        invertGood
      />
      <SummaryCard
        icon={Gauge}
        label="Energy Efficiency Score"
        value={healthScore ? `${healthScore.score}/100` : "—"}
        delta={healthScore ? healthScore.trendDeltaPoints : undefined}
        deltaLabel="pts vs last month"
        staticNote={healthScore ? undefined : "upload a bill to calculate"}
        deltaIsPoints
      />
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: number;
  deltaLabel: string;
  staticNote?: string;
  invertGood?: boolean;
  deltaIsPoints?: boolean;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  staticNote,
  invertGood,
  deltaIsPoints,
}: SummaryCardProps) {
  const isGood = delta === undefined ? true : invertGood ? delta < 0 : delta > 0;
  const DeltaIcon = delta !== undefined && delta < 0 ? TrendingDown : TrendingUp;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">{value}</p>
        {delta !== undefined ? (
          <p className={cn("mt-1 flex items-center gap-1 text-xs", isGood ? "text-primary" : "text-destructive")}>
            <DeltaIcon className="h-3 w-3" />
            {deltaIsPoints ? `${delta > 0 ? "+" : ""}${delta}` : `${Math.abs(delta).toFixed(1)}%`} {deltaLabel}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{staticNote ?? deltaLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
