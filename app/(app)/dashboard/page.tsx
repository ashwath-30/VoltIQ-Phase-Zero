import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Your at-a-glance energy overview and key insights."
      phase={2}
      icon={LayoutDashboard}
      summary="The dashboard will surface your latest bill, energy health score, forecasted costs, and personalized savings — all in one place."
      upcoming={[
        "Energy health score and month-over-month trends",
        "Forecasted next bill with confidence range",
        "Top savings recommendations at a glance",
        "Recent activity and quick actions",
      ]}
    />
  );
}
