import { Bell } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Notifications"
      description="Stay on top of alerts, forecasts, and recommendations."
      phase={7}
      icon={Bell}
      summary="A unified feed will collect usage alerts, forecast updates, and personalized tips, with controls to filter, mark as read, and manage preferences."
      upcoming={[
        "Unified alerts and insights feed",
        "Filter by type and severity",
        "Mark as read and bulk actions",
        "Deep links to relevant sections",
      ]}
    />
  );
}
