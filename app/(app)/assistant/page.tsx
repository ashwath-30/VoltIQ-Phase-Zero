import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function AssistantPage() {
  return (
    <PlaceholderPage
      title="AI Assistant"
      description="Ask questions about your energy usage in plain language."
      phase={5}
      icon={Sparkles}
      summary="A conversational assistant will answer questions about your bills, explain cost changes, and give tailored advice grounded in your own usage data."
      upcoming={[
        "Natural-language questions about your bills",
        "Grounded answers with cited sources",
        "Suggested prompts to get started",
        "Personalized savings guidance",
      ]}
    />
  );
}
