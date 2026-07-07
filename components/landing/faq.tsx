import { Accordion } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does VoltIQ analyze my electricity bill?",
    answer:
      "Upload a photo or PDF of your utility statement and VoltIQ automatically reads your usage, rate plan, and charges. It then compares them against seasonal patterns and local rates to surface insights and savings opportunities, no manual data entry needed.",
  },
  {
    question: "Do I need a smart meter or special hardware?",
    answer:
      "No. VoltIQ works entirely from the bills you already receive. If you do have access to smart-meter data, you can connect it for even more granular insights, but it is completely optional.",
  },
  {
    question: "Which utility providers are supported?",
    answer:
      "VoltIQ supports the vast majority of U.S. investor-owned and municipal utilities, including PG&E, Duke Energy, ConEd, Xcel, Georgia Power, and hundreds more. If your provider isn't recognized, our bill reader still works from the document itself.",
  },
  {
    question: "How is my data kept private and secure?",
    answer:
      "Your bills and personal information are encrypted in transit and at rest. We never sell your data, and you can permanently delete your account and all associated documents at any time from your settings.",
  },
  {
    question: "How accurate are the cost forecasts?",
    answer:
      "Forecasts are generated from your historical usage combined with seasonal and rate-plan modeling. Most households see predictions within a few percent of their actual bill, and accuracy improves as you upload more statements.",
  },
  {
    question: "Can I cancel or downgrade anytime?",
    answer:
      "Absolutely. There are no contracts. You can downgrade to the Free plan or cancel a paid plan at any time and keep access through the end of your billing period.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Everything you need to know about VoltIQ and your energy data.
          </p>
        </div>

        <Accordion items={faqs} className="mt-10" />
      </div>
    </section>
  );
}
