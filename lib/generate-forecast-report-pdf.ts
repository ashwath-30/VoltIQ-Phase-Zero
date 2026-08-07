import { jsPDF } from "jspdf";
import type { Bill } from "@/types";
import type { ForecastResult } from "@/lib/energy-model";
import { formatCurrency, formatKwh } from "@/lib/utils";
import { INK, MUTED, pdfHeader, sectionHeader, statRow, ensureSpace, pdfFooter } from "@/lib/pdf-styles";

interface ProfileInfo {
  name?: string;
  address?: string;
  utilityProvider?: string;
}

export function generateForecastReportPdf(bills: Bill[], forecast: ForecastResult, profile: ProfileInfo) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = pdfHeader(doc, margin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Forecast Report", margin, y);
  y += 28;

  y = sectionHeader(doc, "Predicted Next Bill", margin, y);
  y = statRow(doc, "Estimated Cost", formatCurrency(forecast.predictedCost), margin, y);
  y = statRow(doc, "Estimated Usage", formatKwh(forecast.predictedKwh), margin, y);
  y = statRow(doc, "For Period", forecast.periodLabel, margin, y);
  y = statRow(doc, "Confidence", `${Math.round(forecast.confidence * 100)}%`, margin, y);
  y += 16;

  y = ensureSpace(doc, y, 80);
  y = sectionHeader(doc, "How This Is Calculated", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const methodology = doc.splitTextToSize(
    `This forecast is a real linear regression fitted to your ${bills.length} uploaded bill${
      bills.length === 1 ? "" : "s"
    } — not a guess. Confidence reflects how much historical data supports the estimate: more bills, and more consistent usage patterns, produce a higher confidence score. This is an estimate, not a guarantee — actual bills depend on factors like weather and changes in your household that aren't fully captured here.`,
    pageWidth - margin * 2
  );
  doc.text(methodology, margin, y);
  y += methodology.length * 13 + 20;

  const recent = [...bills].sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)).slice(0, 6);
  if (recent.length > 0) {
    y = ensureSpace(doc, y, 40 + recent.length * 18);
    y = sectionHeader(doc, "Recent Bill History Used", margin, y);
    for (const bill of recent) {
      y = ensureSpace(doc, y, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(bill.billingPeriodLabel, margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(`${formatCurrency(bill.totalCost)}  ·  ${formatKwh(bill.totalKwh)}`, margin + 160, y);
      y += 18;
    }
  }

  pdfFooter(
    doc,
    margin,
    "This report is generated automatically from data you uploaded to VoltIQX. Forecasts are estimates, not guarantees. See VoltIQX's Terms of Service for details."
  );

  doc.save(`VoltIQX-Forecast-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
