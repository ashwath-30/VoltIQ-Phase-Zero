import { FileText, Lightbulb, Bell } from "lucide-react";
import { bills, reports, recommendations, notifications } from "@/lib/mock-data";

export interface SearchResult {
  id: string;
  category: "Bill" | "Report" | "Recommendation" | "Notification";
  title: string;
  subtitle: string;
  href: string;
  icon: typeof FileText;
}

const allResults: SearchResult[] = [
  ...bills.map((b) => ({
    id: b.id,
    category: "Bill" as const,
    title: b.billingPeriodLabel,
    subtitle: `$${b.totalCost.toFixed(0)} · ${b.totalKwh} kWh`,
    href: "/upload",
    icon: FileText,
  })),
  ...reports.map((r) => ({
    id: r.id,
    category: "Report" as const,
    title: r.title,
    subtitle: r.status === "ready" ? "Ready to download" : "Generating...",
    href: "/reports",
    icon: FileText,
  })),
  ...recommendations.map((r) => ({
    id: r.id,
    category: "Recommendation" as const,
    title: r.title,
    subtitle: `Save ~$${r.estimatedSavings}/mo`,
    href: "/analytics",
    icon: Lightbulb,
  })),
  ...notifications.map((n) => ({
    id: n.id,
    category: "Notification" as const,
    title: n.title,
    subtitle: n.description,
    href: "/notifications",
    icon: Bell,
  })),
];

export function searchAll(query: string, limit = 6): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return allResults
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    )
    .slice(0, limit);
}
