import { jsPDF } from "jspdf";

export const EMERALD = [16, 185, 129] as const;
export const SECONDARY = [59, 130, 246] as const;
export const INK = [30, 41, 59] as const;
export const MUTED = [100, 116, 139] as const;

export function pdfHeader(doc: jsPDF, margin: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 64;
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
  return y + 32;
}

export function sectionHeader(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  color: readonly [number, number, number] = EMERALD
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...color);
  doc.text(title.toUpperCase(), x, y);
  return y + 20;
}

export function statRow(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(value, x + 180, y);
  return y + 20;
}

// Starts a fresh page if the current position is too close to the
// bottom margin to fit the next block of content.
export function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 700) {
    doc.addPage();
    return 64;
  }
  return y;
}

export function pdfFooter(doc: jsPDF, margin: number, text: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = 740;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2);
  doc.text(wrapped, margin, footerY);
}
