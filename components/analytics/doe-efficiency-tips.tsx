import { Wind, Home, Droplets, Refrigerator, ExternalLink, Landmark } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getDoeRecommendations, type DoeCategory } from "@/lib/doe-recommendations";

const categoryIcon: Record<DoeCategory, typeof Wind> = {
  hvac: Wind,
  envelope: Home,
  water_heating: Droplets,
  appliance: Refrigerator,
};

export function DoeEfficiencyTips({ avgMonthlyBill }: { avgMonthlyBill: number }) {
  const tips = getDoeRecommendations(avgMonthlyBill);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <div>
            <CardTitle className="text-base">Efficiency Tips</CardTitle>
            <CardDescription>
              General guidance from the U.S. Department of Energy and ENERGY STAR — not computed from
              your bill, unlike the recommendations above
            </CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Government-sourced
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {tips.map((tip) => {
          const Icon = categoryIcon[tip.category];
          return (
            <div key={tip.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-50 dark:bg-secondary-900/30">
                <Icon className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{tip.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tip.fact}</p>
                <a
                  href={tip.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-secondary-600 hover:underline dark:text-secondary-400"
                >
                  Source: {tip.source}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {tip.estimatedMonthlySavings != null && (
                <p className="shrink-0 whitespace-nowrap font-display text-sm font-semibold text-secondary-600 dark:text-secondary-400">
                  ~{formatCurrency(tip.estimatedMonthlySavings)}/mo
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
