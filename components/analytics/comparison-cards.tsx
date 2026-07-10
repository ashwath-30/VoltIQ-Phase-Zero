import { TrendingDown, TrendingUp, Users, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { bills, energyHealthScore } from "@/lib/mock-data";

export function ComparisonCards() {
  const current = bills[0];
  const previous = bills[1];
  const monthOverMonth = previous
    ? ((current.totalCost - previous.totalCost) / previous.totalCost) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ComparisonCard
        icon={CalendarClock}
        label="vs. Last Month"
        value={`${monthOverMonth > 0 ? "+" : ""}${monthOverMonth.toFixed(1)}%`}
        good={monthOverMonth < 0}
        note={`${previous?.billingPeriodLabel ?? "previous period"} → ${current.billingPeriodLabel}`}
      />
      <ComparisonCard
        icon={energyHealthScore.trend === "improving" ? TrendingDown : TrendingUp}
        label="Your Trend"
        value={`${energyHealthScore.trendDeltaPoints > 0 ? "+" : ""}${energyHealthScore.trendDeltaPoints} pts`}
        good={energyHealthScore.trend === "improving"}
        note="Energy Health Score, month over month"
      />
      <ComparisonCard
        icon={Users}
        label="vs. Similar Homes"
        value={`Top ${100 - energyHealthScore.peerPercentile}%`}
        good={energyHealthScore.peerPercentile >= 50}
        note={energyHealthScore.peerComparisonLabel}
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
