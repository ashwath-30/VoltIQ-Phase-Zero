import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Generate and download detailed energy reports."
      phase={6}
      icon={FileText}
      summary="Monthly audits, forecasts, and efficiency summaries will be available to generate, preview, and export as polished PDF reports."
      upcoming={[
        "Monthly audit and annual summary reports",
        "Forecast and efficiency reports",
        "One-click PDF export",
        "Report generation status tracking",
      ]}
    />
  );
}
