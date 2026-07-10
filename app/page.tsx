import { MarketingNavbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Benefits } from "@/components/marketing/benefits";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
