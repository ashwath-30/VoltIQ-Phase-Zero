import { jsPDF } from "jspdf";
import type { Bill } from "@/types";
import { generateRecommendations } from "@/lib/recommendation-engine";
import { formatCurrency, formatKwh } from "@/lib/utils";

interface ProfileInfo {
  name?: string;
  address?: string;
  utilityProvider?: string;
  hasSolar?: boolean;
  hasBattery?: boolean;
  hasEv?: boolean;
}

const EMERALD = [16, 185, 129] as const;
const INK = [30, 41, 59] as const;
const MUTED = [100, 116, 139] as const;

/**
 * Builds a real PDF from one bill's actual data — cost, usage, peak/off-peak
 * split, and recommendations computed specifically for that bill (reusing
 * the same recommendation engine used on the Dashboard and Analytics
 * pages, not separate report-only logic). Triggers a direct browser
 * download; nothing is uploaded or stored server-side.
 */
export function generateMonthlyAuditPdf(bill: Bill, profile: ProfileInfo) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = 64;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...EMERALD);
  doc.text("VoltIQX", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 36;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 32;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(`Monthly Audit — ${bill.billingPeriodLabel}`, margin, y);
  y += 28;

  if (profile.name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const details = [profile.name, profile.address, profile.utilityProvider].filter(Boolean).join("  ·  ");
    doc.text(details, margin, y);
    y += 28;
  }

  // Bill summary section
  y = sectionHeader(doc, "Bill Summary", margin, y);
  const totalUsage = bill.peakUsageKwh + bill.offPeakUsageKwh;
  const peakShare = totalUsage > 0 ? Math.round((bill.peakUsageKwh / totalUsage) * 100) : 0;

  y = statRow(doc, "Total Cost", formatCurrency(bill.totalCost), margin, y);
  y = statRow(doc, "Total Usage", formatKwh(bill.totalKwh), margin, y);
  y = statRow(doc, "Peak Usage", `${formatKwh(bill.peakUsageKwh)} (${peakShare}% of total)`, margin, y);
  y = statRow(doc, "Off-Peak Usage", formatKwh(bill.offPeakUsageKwh), margin, y);
  y += 20;

  // Recommendations section, computed specifically from this bill
  const recs = generateRecommendations(
    [bill],
    {
      hasSolar: !!profile.hasSolar,
      hasBattery: !!profile.hasBattery,
      hasEv: !!profile.hasEv,
    },
    "pdf_rec"
  );

  y = sectionHeader(doc, "Recommendations", margin, y);
  if (recs.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("No specific recommendations for this bill.", margin, y);
    y += 20;
  } else {
    for (const rec of recs) {
      if (y > 680) {
        doc.addPage();
        y = 64;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(`${rec.title}  —  Save ~${formatCurrency(rec.estimatedSavings)}/mo`, margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...MUTED);
      const wrapped = doc.splitTextToSize(rec.description, pageWidth - margin * 2);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 13 + 14;
    }
  }

  // Footer disclaimer
  const footerY = 740;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const disclaimer = doc.splitTextToSize(
    "This report is generated automatically from data you uploaded to VoltIQX. Forecasts, scores, and recommendations are estimates, not guarantees — see VoltIQX's Terms of Service for details.",
    pageWidth - margin * 2
  );
  doc.text(disclaimer, margin, footerY);

  doc.save(`VoltIQX-Monthly-Audit-${bill.billingPeriod}.pdf`);
}

function sectionHeader(doc: jsPDF, title: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...EMERALD);
  doc.text(title.toUpperCase(), x, y);
  return y + 20;
}

function statRow(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(value, x + 160, y);
  return y + 20;
}
