import Link from "next/link";
import { Gauge, Users, ArrowUpRight, ArrowDownRight, Minus, UserCog } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComputedHealthScore } from "@/lib/energy-model";
import type { PeerComparisonResult } from "@/lib/peer-comparison";

const trendConfig = {
  improving: { icon: ArrowUpRight, color: "text-primary", label: "Improving" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
  declining: { icon: ArrowDownRight, color: "text-destructive", label: "Declining" },
} as const;

interface EnergyHealthScoreWidgetProps {
  healthScore: ComputedHealthScore | null;
  peerComparison: PeerComparisonResult | null;
  profileComplete: boolean;
}

export function EnergyHealthScoreWidget({
  healthScore,
  peerComparison,
  profileComplete,
}: EnergyHealthScoreWidgetProps) {
  if (!healthScore) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Energy Health Score</CardTitle>
          </div>
          <CardDescription>Upload your first bill to calculate this</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload" className="text-sm font-medium text-primary hover:underline">
            Upload a bill →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const trend = trendConfig[healthScore.trend];
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Energy Health Score</CardTitle>
        </div>
        <CardDescription>Computed from your real bill history — recalculated with every upload</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-end gap-3">
          <span className="font-display text-4xl font-bold tracking-tight">{healthScore.score}</span>
          <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
          <span className={cn("mb-1.5 ml-auto flex items-center gap-1 text-xs font-medium", trend.color)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.label}
            {healthScore.trendDeltaPoints !== 0 &&
              ` (${healthScore.trendDeltaPoints > 0 ? "+" : ""}${healthScore.trendDeltaPoints} pts)`}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
            style={{ width: `${healthScore.score}%` }}
          />
        </div>

        {/* Peer comparison is real, aggregate data across users — computed
            through a privacy-preserving database function that never exposes
            any individual user's data. It only appears once there's enough
            real data to make it honest, rather than showing a placeholder. */}
        {!profileComplete ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <UserCog className="h-3.5 w-3.5 shrink-0" />
            <span>
              Add your home size in{" "}
              <Link href="/profile" className="font-medium text-primary hover:underline">
                Profile
              </Link>{" "}
              to compare against similar homes
            </span>
          </div>
        ) : peerComparison && peerComparison.percentile !== null ? (
          <div className="flex items-center gap-2 rounded-lg bg-secondary-50 px-3 py-2 text-xs text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-300">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Using less energy than {peerComparison.percentile}% of {peerComparison.comparableHomes} similar-sized
            homes
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Not enough similar homes on VoltIQX yet to compare
            {peerComparison ? ` (${peerComparison.comparableHomes} so far)` : ""}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">What's driving your score</p>
          <div className="flex flex-col gap-2">
            {healthScore.factors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Upload a couple more bills to see what's influencing your score.
              </p>
            ) : (
              healthScore.factors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-foreground">{factor.label}</span>
                  <Badge variant={factor.impact === "positive" ? "success" : "warning"} className="shrink-0">
                    {factor.impact === "positive" ? "+" : "−"} {factor.weight}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
