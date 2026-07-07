import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Benefits } from "@/components/landing/benefits";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Benefits />
        <Testimonials />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
