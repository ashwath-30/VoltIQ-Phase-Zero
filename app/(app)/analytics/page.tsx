import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Deep dive into your consumption patterns over time."
      phase={4}
      icon={BarChart3}
      summary="Interactive charts will break down your usage by month, time-of-use, and appliance so you can see exactly where your energy — and money — goes."
      upcoming={[
        "Monthly usage and cost trends",
        "Peak vs. off-peak breakdown",
        "Appliance-level consumption",
        "Carbon footprint tracking",
      ]}
    />
  );
}
