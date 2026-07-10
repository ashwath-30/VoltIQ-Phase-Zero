import type { Bill } from "@/types";

export interface ForecastResult {
  predictedCost: number;
  predictedKwh: number;
  confidence: number; // 0-1
  periodLabel: string;
}

export interface HealthScoreFactor {
  label: string;
  impact: "positive" | "negative";
  weight: "high" | "medium" | "low";
}

export interface ComputedHealthScore {
  score: number; // 0-100
  trend: "improving" | "stable" | "declining";
  trendDeltaPoints: number;
  factors: HealthScoreFactor[];
}

/**
 * Simple least-squares linear regression over an array of numbers,
 * treating their index (0, 1, 2...) as the x-axis. Returns the slope
 * and intercept of the best-fit line, so we can project one step past
 * the last data point.
 */
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function coefficientOfVariation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function nextPeriodLabel(lastPeriod: string): { period: string; label: string } {
  const [yearStr, monthStr] = lastPeriod.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const date = new Date(nextYear, nextMonth - 1, 1);
  const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return { period: `${nextYear}-${String(nextMonth).padStart(2, "0")}`, label };
}

/**
 * Forecasts next month's cost and kWh from the user's real bill history.
 *
 * This is a transparent heuristic, not a trained ML model — it fits a
 * straight line through the user's last few bills and projects one step
 * ahead. Confidence is derived from two things: how much history exists
 * (more bills = more confidence, up to a point) and how volatile the
 * usage has been (a household with wildly swinging bills gets a lower
 * confidence score than one with a steady pattern) — both computed from
 * the same real numbers, not asserted.
 */
export function computeForecast(bills: Bill[]): ForecastResult | null {
  if (bills.length === 0) return null;

  // Expect bills sorted oldest -> newest for the regression to make sense.
  const sorted = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  const costs = sorted.map((b) => b.totalCost);
  const kwhs = sorted.map((b) => b.totalKwh);

  const lastBill = sorted[sorted.length - 1];
  const { period: nextPeriod, label: periodLabel } = nextPeriodLabel(lastBill.billingPeriod);

  if (sorted.length === 1) {
    // Not enough history for a trend line yet — best available estimate
    // is simply "similar to your only bill so far," with low confidence.
    return {
      predictedCost: Math.round(costs[0]),
      predictedKwh: Math.round(kwhs[0]),
      confidence: 0.35,
      periodLabel,
    };
  }

  const costTrend = linearRegression(costs);
  const kwhTrend = linearRegression(kwhs);
  const n = sorted.length;

  const predictedCost = Math.max(0, costTrend.slope * n + costTrend.intercept);
  const predictedKwh = Math.max(0, kwhTrend.slope * n + kwhTrend.intercept);

  // More history raises confidence, capped so it doesn't imply false
  // certainty; higher volatility (relative to the average) lowers it.
  const dataConfidence = Math.min(0.5 + n * 0.06, 0.8);
  const volatilityPenalty = coefficientOfVariation(costs) * 1.2;
  const confidence = Math.max(0.3, Math.min(0.92, dataConfidence - volatilityPenalty));

  return {
    predictedCost: Math.round(predictedCost),
    predictedKwh: Math.round(predictedKwh),
    confidence: Math.round(confidence * 100) / 100,
    periodLabel,
  };
}

/**
 * Computes an Energy Health Score from the user's real bill history.
 *
 * Deliberately NOT a black box: the score starts at a neutral baseline
 * and every factor that moves it away from that baseline is listed in
 * `factors`, in plain language, so the number is always explainable.
 * This does not include any comparison to other users — that requires
 * real aggregate data across many people and is computed separately
 * (see lib/peer-comparison.ts), with an honest "not enough data yet"
 * state when too few comparable homes exist.
 */
export function computeEnergyHealthScore(bills: Bill[]): ComputedHealthScore | null {
  if (bills.length === 0) return null;

  const sorted = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  const kwhs = sorted.map((b) => b.totalKwh);
  const latest = sorted[sorted.length - 1];

  let score = 70;
  const factors: HealthScoreFactor[] = [];

  if (sorted.length >= 2) {
    const previous = sorted.slice(0, -1);
    const prevAvg = previous.reduce((a, b) => a + b.totalKwh, 0) / previous.length;
    const percentChange = prevAvg === 0 ? 0 : (latest.totalKwh - prevAvg) / prevAvg;

    if (percentChange < -0.03) {
      score += 10;
      factors.push({
        label: "Usage trending down vs. your recent average",
        impact: "positive",
        weight: percentChange < -0.1 ? "high" : "medium",
      });
    } else if (percentChange > 0.03) {
      score -= 10;
      factors.push({
        label: "Usage trending up vs. your recent average",
        impact: "negative",
        weight: percentChange > 0.1 ? "high" : "medium",
      });
    } else {
      factors.push({ label: "Usage holding steady month to month", impact: "positive", weight: "low" });
    }
  }

  if (sorted.length >= 3) {
    const cv = coefficientOfVariation(kwhs);
    if (cv < 0.1) {
      score += 6;
      factors.push({ label: "Consistent usage pattern across your bills", impact: "positive", weight: "low" });
    } else if (cv > 0.25) {
      score -= 6;
      factors.push({ label: "Usage varies a lot month to month", impact: "negative", weight: "medium" });
    }
  }

  const totalPeak = latest.peakUsageKwh;
  const totalUsage = latest.peakUsageKwh + latest.offPeakUsageKwh;
  if (totalUsage > 0) {
    const peakShare = totalPeak / totalUsage;
    if (peakShare > 0.45) {
      score -= 8;
      factors.push({
        label: "High share of usage falls in peak pricing hours",
        impact: "negative",
        weight: "high",
      });
    } else if (peakShare < 0.3) {
      score += 8;
      factors.push({
        label: "Most of your usage avoids peak pricing hours",
        impact: "positive",
        weight: "medium",
      });
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const trend: ComputedHealthScore["trend"] =
    score >= 75 ? "improving" : score <= 55 ? "declining" : "stable";

  // Expressed directly from the underlying trend factor above, not a
  // separate re-computation — kept simple and consistent with `factors`.
  const trendFactor = factors.find((f) => f.label.includes("trending"));
  const trendDeltaPoints = trendFactor ? (trendFactor.impact === "positive" ? 6 : -6) : 0;

  return { score, trend, trendDeltaPoints, factors };
}
