import type { Bill, MonthlyUsagePoint } from "@/types";

export function mapDbBillToBill(row: Record<string, any>): Bill {
  return {
    id: row.id,
    userId: row.user_id,
    uploadDate: row.upload_date,
    billingPeriod: row.billing_period,
    billingPeriodLabel: row.billing_period_label,
    totalCost: Number(row.total_cost) || 0,
    totalKwh: Number(row.total_kwh) || 0,
    peakUsageKwh: row.peak_usage_kwh != null ? Number(row.peak_usage_kwh) : 0,
    offPeakUsageKwh: row.off_peak_usage_kwh != null ? Number(row.off_peak_usage_kwh) : 0,
    pdfName: row.pdf_name ?? "",
    status: row.status,
  };
}

// Converts real bills (sorted oldest -> newest) into the shape the shared
// dashboard/analytics charts expect. Carbon is estimated from kWh using
// the same emissions factor used throughout the app's mock data, since
// bills don't include a direct carbon figure.
const CARBON_FACTOR_KG_PER_KWH = 0.42;

export function billsToMonthlyPoints(bills: Bill[]): MonthlyUsagePoint[] {
  const sorted = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  return sorted.map((bill) => ({
    month: bill.billingPeriodLabel,
    cost: bill.totalCost,
    kwh: bill.totalKwh,
    peak: bill.peakUsageKwh,
    offPeak: bill.offPeakUsageKwh,
    carbonKg: Math.round(bill.totalKwh * CARBON_FACTOR_KG_PER_KWH),
  }));
}
