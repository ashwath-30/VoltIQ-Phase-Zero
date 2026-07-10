import { Wind, Sun, Battery, Car, Wrench, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { recommendations } from "@/lib/mock-data";

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

export function SavingsOpportunitiesList() {
  const sorted = [...recommendations].sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  const totalSavings = sorted.reduce((sum, r) => sum + r.estimatedSavings, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Opportunities</CardTitle>
        <CardDescription>
          Ranked by estimated monthly savings — up to {formatCurrency(totalSavings)}/mo available
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {sorted.map((rec) => {
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
        })}
      </CardContent>
    </Card>
  );
}
