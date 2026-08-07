import { jsPDF } from "jspdf";
import type { Bill } from "@/types";
import { formatCurrency, formatKwh } from "@/lib/utils";
import { INK, MUTED, pdfHeader, sectionHeader, statRow, ensureSpace, pdfFooter } from "@/lib/pdf-styles";

interface ProfileInfo {
  name?: string;
  address?: string;
  utilityProvider?: string;
}

export function generateAnnualSummaryPdf(year: string, billsInYear: Bill[], profile: ProfileInfo) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = pdfHeader(doc, margin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(`${year} Annual Summary`, margin, y);
  y += 24;

  if (billsInYear.length < 12) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`Based on ${billsInYear.length} of 12 months — this year's data is still partial.`, margin, y);
    y += 20;
  } else {
    y += 4;
  }

  const sorted = [...billsInYear].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  const totalCost = sorted.reduce((s, b) => s + b.totalCost, 0);
  const totalKwh = sorted.reduce((s, b) => s + b.totalKwh, 0);
  const avgCost = totalCost / sorted.length;
  const highest = [...sorted].sort((a, b) => b.totalCost - a.totalCost)[0];
  const lowest = [...sorted].sort((a, b) => a.totalCost - b.totalCost)[0];

  y = sectionHeader(doc, "Year at a Glance", margin, y);
  y = statRow(doc, "Total Cost", formatCurrency(totalCost), margin, y);
  y = statRow(doc, "Total Usage", formatKwh(totalKwh), margin, y);
  y = statRow(doc, "Average Monthly Cost", formatCurrency(avgCost), margin, y);
  y = statRow(doc, "Highest Bill", `${formatCurrency(highest.totalCost)} (${highest.billingPeriodLabel})`, margin, y);
  y = statRow(doc, "Lowest Bill", `${formatCurrency(lowest.totalCost)} (${lowest.billingPeriodLabel})`, margin, y);
  y += 16;

  y = ensureSpace(doc, y, 40 + sorted.length * 18);
  y = sectionHeader(doc, "Month-by-Month", margin, y);
  for (const bill of sorted) {
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

  pdfFooter(
    doc,
    margin,
    "This report is generated automatically from bills you uploaded to VoltIQX. See VoltIQX's Terms of Service for details."
  );

  doc.save(`VoltIQX-Annual-Summary-${year}.pdf`);
}
