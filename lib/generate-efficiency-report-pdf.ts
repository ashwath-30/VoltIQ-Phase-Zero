import { jsPDF } from "jspdf";
import type { ComputedHealthScore } from "@/lib/energy-model";
import type { GeneratedRecommendation } from "@/lib/recommendation-engine";
import { getDoeRecommendations } from "@/lib/doe-recommendations";
import { formatCurrency } from "@/lib/utils";
import { EMERALD, SECONDARY, INK, MUTED, pdfHeader, sectionHeader, ensureSpace, pdfFooter } from "@/lib/pdf-styles";

interface ProfileInfo {
  name?: string;
  address?: string;
  utilityProvider?: string;
}

export function generateEfficiencyReportPdf(
  healthScore: ComputedHealthScore,
  recommendations: GeneratedRecommendation[],
  avgMonthlyBill: number,
  profile: ProfileInfo
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = pdfHeader(doc, margin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Efficiency Report", margin, y);
  y += 28;

  y = sectionHeader(doc, "Energy Health Score", margin, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...EMERALD);
  doc.text(`${healthScore.score}/100`, margin, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Trend: ${healthScore.trend}`, margin + 110, y + 4);
  y += 34;

  if (healthScore.factors.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    for (const factor of healthScore.factors) {
      y = ensureSpace(doc, y, 16);
      doc.text(`•  ${factor.label}`, margin, y);
      y += 15;
    }
  }
  y += 16;

  y = ensureSpace(doc, y, 60);
  y = sectionHeader(doc, "Recommendations — computed from your bills", margin, y);
  if (recommendations.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("No specific recommendations right now.", margin, y);
    y += 20;
  } else {
    for (const rec of recommendations) {
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

  y += 8;
  y = ensureSpace(doc, y, 80);
  y = sectionHeader(doc, "General Efficiency Tips (U.S. DOE / ENERGY STAR)", margin, y, SECONDARY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("General guidance below — not calculated from your specific bills.", margin, y);
  y += 16;

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

  pdfFooter(
    doc,
    margin,
    "This report is generated automatically from data you uploaded to VoltIQX. General Efficiency Tips are sourced from the U.S. Department of Energy and ENERGY STAR and are not personalized to your specific home. See VoltIQX's Terms of Service for details."
  );

  doc.save(`VoltIQX-Efficiency-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
