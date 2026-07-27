import type { Bill } from "@/types";

export interface DegreeDayPoint {
  billId: string;
  billingPeriod: string;
  totalKwh: number;
  hdd: number;
  cdd: number;
}

export interface RegressionResult {
  intercept: number; // baseline kWh/month, independent of weather
  hddCoef: number; // kWh per heating-degree-day
  cddCoef: number; // kWh per cooling-degree-day
  rSquared: number; // 0-1, how well weather explains the usage variation
  dataPoints: number;
}

export interface UsageSplit {
  billId: string;
  billingPeriod: string;
  totalKwh: number;
  weatherKwh: number; // portion attributable to heating/cooling demand
  baselineKwh: number; // everything else — the number that actually
  // matters for "did something change at my house" questions
}

const MIN_DATA_POINTS = 4;

/**
 * Converts a "YYYY-MM" billing period into calendar-month start/end
 * dates. This is a real, honest approximation — actual utility billing
 * cycles rarely align exactly with calendar months, but we only store a
 * month label, not exact cycle dates, so this is the best available
 * mapping without inventing precision we don't have.
 */
export function billingPeriodToDateRange(billingPeriod: string): { start: string; end: string } {
  const [year, month] = billingPeriod.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // day 0 of next month = last day of this month
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

/**
 * Solves a 3x3 linear system via Gaussian elimination with partial
 * pivoting. Used for the regression's normal equations — no external
 * statistics library needed for a 3-parameter fit.
 */
function solve3x3(A: number[][], b: number[]): number[] | null {
  const m = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < 3; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivotRow][col])) pivotRow = row;
    }
    if (Math.abs(m[pivotRow][col]) < 1e-10) return null; // singular — can't solve
    [m[col], m[pivotRow]] = [m[pivotRow], m[col]];

    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = m[row][col] / m[col][col];
      for (let k = col; k < 4; k++) m[row][k] -= factor * m[col][k];
    }
  }

  return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
}

/**
 * Fits usage (kWh) against heating and cooling degree days across a
 * user's real bill history: kWh ≈ intercept + hddCoef·HDD + cddCoef·CDD.
 * This is the PRISM approach (Fels, 1986) — separating weather-driven
 * demand from a weather-independent baseline via regression, not a
 * guess.
 *
 * Returns null if there isn't enough real data to fit a meaningful
 * model — an honest "not enough history yet" case, same pattern as
 * this app's other real models (forecast, peer comparison).
 */
export function fitDegreeDayRegression(points: DegreeDayPoint[]): RegressionResult | null {
  if (points.length < MIN_DATA_POINTS) return null;

  const n = points.length;
  const sums = points.reduce(
    (acc, p) => ({
      kwh: acc.kwh + p.totalKwh,
      hdd: acc.hdd + p.hdd,
      cdd: acc.cdd + p.cdd,
      hddSq: acc.hddSq + p.hdd * p.hdd,
      cddSq: acc.cddSq + p.cdd * p.cdd,
      hddCdd: acc.hddCdd + p.hdd * p.cdd,
      hddKwh: acc.hddKwh + p.hdd * p.totalKwh,
      cddKwh: acc.cddKwh + p.cdd * p.totalKwh,
    }),
    { kwh: 0, hdd: 0, cdd: 0, hddSq: 0, cddSq: 0, hddCdd: 0, hddKwh: 0, cddKwh: 0 }
  );

  const A = [
    [n, sums.hdd, sums.cdd],
    [sums.hdd, sums.hddSq, sums.hddCdd],
    [sums.cdd, sums.hddCdd, sums.cddSq],
  ];
  const b = [sums.kwh, sums.hddKwh, sums.cddKwh];

  const solution = solve3x3(A, b);
  if (!solution) return null;

  const [intercept, hddCoef, cddCoef] = solution;

  // R² — how much of the real variation in usage is explained by
  // weather, vs. left over as unexplained (baseline + noise).
  const meanKwh = sums.kwh / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const p of points) {
    const predicted = intercept + hddCoef * p.hdd + cddCoef * p.cdd;
    ssTot += (p.totalKwh - meanKwh) ** 2;
    ssRes += (p.totalKwh - predicted) ** 2;
  }
  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  return { intercept, hddCoef, cddCoef, rSquared, dataPoints: n };
}

/**
 * Splits one bill's real usage into a weather-driven portion and a
 * baseline portion, using the fitted regression. Coefficients are
 * clamped at zero — a negative "heating coefficient" would be
 * physically meaningless (more heating degree-days can't ever reduce
 * usage), so any noise that produces one is treated as zero contribution
 * rather than an implausible negative one.
 */
export function splitUsage(bill: DegreeDayPoint, regression: RegressionResult): UsageSplit {
  const weatherKwh = Math.max(0, regression.hddCoef) * bill.hdd + Math.max(0, regression.cddCoef) * bill.cdd;
  const clampedWeatherKwh = Math.min(weatherKwh, bill.totalKwh); // can't exceed the real total
  const baselineKwh = bill.totalKwh - clampedWeatherKwh;

  return {
    billId: bill.billId,
    billingPeriod: bill.billingPeriod,
    totalKwh: bill.totalKwh,
    weatherKwh: Math.round(clampedWeatherKwh),
    baselineKwh: Math.round(baselineKwh),
  };
}
