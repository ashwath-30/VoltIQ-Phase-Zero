import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "How does VoltIQ analyze my bill?",
    answer:
      "Upload a PDF of your utility bill and VoltIQ extracts your usage, cost, and billing period, then breaks it down by likely appliance category and compares it against your historical patterns.",
  },
  {
    question: "Which utility providers are supported?",
    answer:
      "VoltIQ is designed to work with standard residential electricity bills from most major U.S. utility providers. Support is expanding as more bill formats are added.",
  },
  {
    question: "Is my data kept private?",
    answer: (
      <>
        Your bills and account information are yours. VoltIQ doesn't sell your data, and you can
        request deletion of your account and all associated data at any time from Settings. Read our
        full{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        for details.
      </>
    ),
  },
  {
    question: "Do I need solar panels or a battery to use VoltIQ?",
    answer:
      "No — VoltIQ works for any home, and the recommendations engine adjusts based on whether you have solar, a battery, or an EV, which you can set in your profile.",
  },
  {
    question: "How accurate are the bill forecasts?",
    answer:
      "Forecasts include a confidence score alongside the prediction, so you always know how much to trust a given estimate rather than treating it as guaranteed.",
  },
  {
    question: "Can I use VoltIQ on my phone?",
    answer:
      "Yes, VoltIQ is fully responsive and works in any mobile browser — no app download required.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
