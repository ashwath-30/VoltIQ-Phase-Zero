import type { Bill } from "@/types";
import type { ForecastResult, ComputedHealthScore } from "@/lib/energy-model";

export interface GeneratedNotification {
  type: "usage" | "forecast" | "hvac" | "solar" | "ev" | "system";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

/**
 * Checks a user's real bill history, forecast, and health score against a
 * few defined thresholds and returns any notifications that are actually
 * warranted. Deliberately does NOT generate appliance-specific claims
 * (e.g. "your HVAC is inefficient") since the app has no appliance-level
 * data to back that up — only total/peak/off-peak kWh per bill. Where the
 * original mock data implied that kind of specificity, these rules use
 * more general, honestly-supportable language instead.
 */
export function generateNotifications(
  bills: Bill[],
  forecast: ForecastResult | null,
  healthScore: ComputedHealthScore | null
): GeneratedNotification[] {
  const notifications: GeneratedNotification[] = [];
  if (bills.length === 0) return notifications;

  const sorted = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  const latest = sorted[sorted.length - 1];

  // Rule 1: usage spike vs. the user's own recent average
  if (sorted.length >= 2) {
    const previous = sorted.slice(0, -1);
    const avgKwh = previous.reduce((sum, b) => sum + b.totalKwh, 0) / previous.length;
    if (avgKwh > 0) {
      const pctChange = (latest.totalKwh - avgKwh) / avgKwh;
      if (pctChange > 0.15) {
        notifications.push({
          type: "usage",
          title: "High electricity usage detected",
          description: `Your ${latest.billingPeriodLabel} usage is ${Math.round(
            pctChange * 100
          )}% above your recent average.`,
          severity: pctChange > 0.3 ? "critical" : "warning",
        });
      }
    }
  }

  // Rule 2: forecasted bill increase
  if (forecast && forecast.predictedCost > latest.totalCost * 1.1) {
    notifications.push({
      type: "forecast",
      title: "Forecasted bill increase",
      description: `Next month's bill is projected to be about $${Math.round(
        forecast.predictedCost - latest.totalCost
      )} higher than your last bill.`,
      severity: "info",
    });
  }

  // Rule 3: high share of peak-hour usage (kept general, not attributed
  // to a specific appliance we can't actually identify)
  const totalUsage = latest.peakUsageKwh + latest.offPeakUsageKwh;
  if (totalUsage > 0) {
    const peakShare = latest.peakUsageKwh / totalUsage;
    if (peakShare > 0.45) {
      notifications.push({
        type: "usage",
        title: "Peak-hour usage is high this cycle",
        description: `${Math.round(
          peakShare * 100
        )}% of your usage fell in peak pricing hours — shifting habits to off-peak times could lower your cost per kWh.`,
        severity: "warning",
      });
    }
  }

  // Rule 4: declining Energy Health Score
  if (healthScore && healthScore.trend === "declining") {
    notifications.push({
      type: "system",
      title: "Energy Health Score trending down",
      description: `Your score dropped to ${healthScore.score}/100 this cycle. Check the Dashboard for what's driving the change.`,
      severity: "warning",
    });
  }

  return notifications;
}
