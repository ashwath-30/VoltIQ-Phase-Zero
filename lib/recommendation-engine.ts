import type { Bill } from "@/types";

export interface GeneratedRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  priority: "high" | "medium" | "low";
  category: "hvac" | "solar" | "battery" | "ev" | "appliance" | "behavior";
}

interface ProfileFlags {
  hasSolar: boolean;
  hasBattery: boolean;
  hasEv: boolean;
}

/**
 * Generates savings recommendations from a user's REAL bill history and
 * profile. Every dollar figure here is derived from their actual data —
 * but where the underlying math requires an assumption we can't verify
 * (like a typical time-of-use rate differential, since we don't have the
 * user's exact peak/off-peak pricing), the description says so plainly
 * rather than presenting a guess as a precise personalized number.
 */
export function generateRecommendations(
  bills: Bill[],
  profile: ProfileFlags,
  idPrefix = "rec"
): GeneratedRecommendation[] {
  if (bills.length === 0) return [];

  const sorted = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  const latest = sorted[sorted.length - 1];
  const avgCost = sorted.reduce((sum, b) => sum + b.totalCost, 0) / sorted.length;
  const blendedRate = latest.totalKwh > 0 ? latest.totalCost / latest.totalKwh : 0;

  const recs: GeneratedRecommendation[] = [];
  let idx = 0;
  const nextId = () => `${idPrefix}_${idx++}`;

  // Peak-hour usage shift
  const totalUsage = latest.peakUsageKwh + latest.offPeakUsageKwh;
  if (totalUsage > 0) {
    const peakShare = latest.peakUsageKwh / totalUsage;
    if (peakShare > 0.4) {
      const peakDollarValue = latest.peakUsageKwh * blendedRate;
      const roughSavings = Math.max(Math.round(peakDollarValue * 0.15), 5);
      recs.push({
        id: nextId(),
        title: profile.hasEv ? "Shift EV charging to off-peak hours" : "Shift usage to off-peak hours",
        description: `${Math.round(peakShare * 100)}% of your last bill's usage fell in peak pricing hours.${
          profile.hasEv ? " Charging your EV overnight instead" : " Moving flexible usage to off-peak times"
        } typically lowers cost per kWh. This is a rough estimate based on typical time-of-use pricing patterns — not your utility's exact rate structure, which we don't have access to.`,
        estimatedSavings: roughSavings,
        priority: peakShare > 0.55 ? "high" : "medium",
        category: profile.hasEv ? "ev" : "behavior",
      });
    }
  }

  // Rising usage trend vs. the user's own recent average
  if (sorted.length >= 2) {
    const previous = sorted.slice(0, -1);
    const prevAvg = previous.reduce((sum, b) => sum + b.totalCost, 0) / previous.length;
    if (latest.totalCost > prevAvg * 1.1) {
      recs.push({
        id: nextId(),
        title: "Investigate your recent usage increase",
        description: `Your last bill ($${latest.totalCost.toFixed(
          0
        )}) is notably higher than your recent average ($${prevAvg.toFixed(
          0
        )}). New appliances, occupancy changes, or seasonal HVAC use are common causes worth checking.`,
        estimatedSavings: Math.round(latest.totalCost - prevAvg),
        priority: "high",
        category: "behavior",
      });
    }
  }

  // Solar feasibility — only suggested if they don't already have it
  if (!profile.hasSolar && avgCost > 80) {
    recs.push({
      id: nextId(),
      title: "Consider a solar feasibility assessment",
      description: `Homes with a usage pattern like yours (averaging $${Math.round(
        avgCost
      )}/mo) often offset 40-70% of grid usage with solar. This is a rough industry-typical estimate, not a personalized solar analysis — actual savings depend on your roof, orientation, and local sun exposure, which we don't have data on.`,
      estimatedSavings: Math.round(avgCost * 0.5),
      priority: "medium",
      category: "solar",
    });
  }

  // Battery — only makes sense to suggest alongside existing solar
  if (profile.hasSolar && !profile.hasBattery) {
    recs.push({
      id: nextId(),
      title: "A home battery could capture more of your solar",
      description:
        "Since you already have solar, a battery lets you store excess daytime generation instead of exporting it — covering more of your evening usage from your own panels rather than the grid.",
      estimatedSavings: Math.round(avgCost * 0.15),
      priority: "low",
      category: "battery",
    });
  }

  return recs.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}
