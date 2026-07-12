import { Wind, Sun, Battery, Car, Wrench, Activity, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { formatCurrency } from "@/lib/utils";
import type { GeneratedRecommendation } from "@/lib/recommendation-engine";

const categoryIcon = {
  hvac: Wind,
  solar: Sun,
  battery: Battery,
  ev: Car,
  appliance: Wrench,
  behavior: Activity,
} as const;

const priorityVariant = {
  high: "destructive",
  medium: "warning",
  low: "muted",
} as const;

export function SavingsOpportunitiesList({ recommendations }: { recommendations: GeneratedRecommendation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Opportunities</CardTitle>
        <CardDescription>Computed from your real bill history and home profile</CardDescription>
      </CardHeader>
      <CardContent className={recommendations.length === 0 ? undefined : "flex flex-col divide-y divide-border"}>
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description="Upload a couple of bills — and fill in your home profile — for VoltIQX to surface real, personalized suggestions here."
          />
        ) : (
          recommendations.map((rec) => {
            const Icon = categoryIcon[rec.category];
            return (
              <div key={rec.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <Badge variant={priorityVariant[rec.priority]} className="capitalize">
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <p className="shrink-0 whitespace-nowrap font-display text-sm font-semibold text-primary">
                  {formatCurrency(rec.estimatedSavings)}/mo
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
