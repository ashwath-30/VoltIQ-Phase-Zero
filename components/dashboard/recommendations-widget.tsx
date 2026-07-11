import Link from "next/link";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { formatCurrency } from "@/lib/utils";
import type { GeneratedRecommendation } from "@/lib/recommendation-engine";

const priorityVariant = {
  high: "destructive",
  medium: "warning",
  low: "muted",
} as const;

export function RecommendationsWidget({ recommendations }: { recommendations: GeneratedRecommendation[] }) {
  const top3 = recommendations.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <div>
            <CardTitle className="text-base">Recommendations</CardTitle>
            <CardDescription>Computed from your real bill history — not generic tips</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {top3.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description="Upload a couple of bills and VoltIQ will surface real, personalized suggestions here."
          />
        ) : (
          top3.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <Badge variant={priorityVariant[rec.priority]} className="shrink-0 capitalize">
                    {rec.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  Save ~{formatCurrency(rec.estimatedSavings)}/mo
                </p>
              </div>
            </div>
          ))
        )}

        <Button variant="ghost" size="sm" className="mt-1 justify-between" asChild>
          <Link href="/analytics">
            View all recommendations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
