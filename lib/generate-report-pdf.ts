import { jsPDF } from "jspdf";
import type { Bill } from "@/types";
import { generateRecommendations } from "@/lib/recommendation-engine";
import { getDoeRecommendations } from "@/lib/doe-recommendations";
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
const SECONDARY = [59, 130, 246] as const;
const INK = [30, 41, 59] as const;
const MUTED = [100, 116, 139] as const;

/**
 * Builds a real PDF from one bill's actual data — cost, usage, peak/off-peak
 * split, personalized recommendations, AND (new in Mission 2 Phase 2) a
 * section of general, government-sourced efficiency facts. The two
 * recommendation sections are visually and textually distinct — one is
 * computed from this specific bill, the other is general DOE/ENERGY STAR
 * guidance — so a reader never mistakes one for the other.
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
  y = sectionHeader(doc, "Bill Summary", margin, y, EMERALD);
  const totalUsage = bill.peakUsageKwh + bill.offPeakUsageKwh;
  const peakShare = totalUsage > 0 ? Math.round((bill.peakUsageKwh / totalUsage) * 100) : 0;

  y = statRow(doc, "Total Cost", formatCurrency(bill.totalCost), margin, y);
  y = statRow(doc, "Total Usage", formatKwh(bill.totalKwh), margin, y);
  y = statRow(doc, "Peak Usage", `${formatKwh(bill.peakUsageKwh)} (${peakShare}% of total)`, margin, y);
  y = statRow(doc, "Off-Peak Usage", formatKwh(bill.offPeakUsageKwh), margin, y);
  y += 20;

  // Personalized recommendations, computed specifically from this bill
  const recs = generateRecommendations(
    [bill],
    {
      hasSolar: !!profile.hasSolar,
      hasBattery: !!profile.hasBattery,
      hasEv: !!profile.hasEv,
    },
    "pdf_rec"
  );

  y = ensureSpace(doc, y, 60);
  y = sectionHeader(doc, "Recommendations — computed from this bill", margin, y, EMERALD);
  if (recs.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("No specific recommendations for this bill.", margin, y);
    y += 20;
  } else {
    for (const rec of recs) {
      y = ensureSpace(doc, y, 60);
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

  // General Efficiency Tips — government-sourced, NOT computed from this
  // bill. Deliberately a separate section with its own heading color and
  // an explicit note plus a real citation per tip, so it's never confused
  // with the personalized recommendations above.
  y += 8;
  y = ensureSpace(doc, y, 80);
  y = sectionHeader(doc, "General Efficiency Tips (U.S. DOE / ENERGY STAR)", margin, y, SECONDARY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("General guidance below — not calculated from your specific bill.", margin, y);
  y += 16;

  const avgMonthlyBill = bill.totalCost;
  const doeTips = getDoeRecommendations(avgMonthlyBill);

  for (const tip of doeTips) {
    y = ensureSpace(doc, y, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    const savingsLabel = tip.estimatedMonthlySavings != null ? `  —  ~${formatCurrency(tip.estimatedMonthlySavings)}/mo` : "";
    doc.text(`${tip.title}${savingsLabel}`, margin, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const wrappedFact = doc.splitTextToSize(tip.fact, pageWidth - margin * 2);
    doc.text(wrappedFact, margin, y);
    y += wrappedFact.length * 12 + 4;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...SECONDARY);
    doc.text(`Source: ${tip.source}`, margin, y);
    y += 18;
  }

  // Footer disclaimer
  addFooter(doc, margin, pageWidth);

  doc.save(`VoltIQX-Monthly-Audit-${bill.billingPeriod}.pdf`);
}

function sectionHeader(doc: jsPDF, title: string, x: number, y: number, color: readonly [number, number, number]): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...color);
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

// Starts a fresh page if the current position is too close to the
// bottom margin to fit the next block of content.
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 700) {
    doc.addPage();
    return 64;
  }
  return y;
}

function addFooter(doc: jsPDF, margin: number, pageWidth: number) {
  const footerY = 740;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const disclaimer = doc.splitTextToSize(
    "This report is generated automatically from data you uploaded to VoltIQX. Forecasts, scores, and personalized recommendations are estimates, not guarantees. General Efficiency Tips are sourced from the U.S. Department of Energy and ENERGY STAR and are not personalized to your specific home. See VoltIQX's Terms of Service for details.",
    pageWidth - margin * 2
  );
  doc.text(disclaimer, margin, footerY);
}
