import { Upload } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function UploadBillPage() {
  return (
    <PlaceholderPage
      title="Upload Bill"
      description="Add a utility bill so VoltIQ can analyze your usage."
      phase={3}
      icon={Upload}
      summary="You'll be able to drag and drop a PDF or image of your electricity bill and watch VoltIQ extract usage, costs, and billing periods automatically."
      upcoming={[
        "Drag-and-drop PDF and image upload",
        "Automatic usage and cost extraction",
        "Processing status with progress feedback",
        "Bill history and re-processing",
      ]}
    />
  );
}
