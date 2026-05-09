import { Hero } from "@/src/components/marketing/Hero";
import { Problem } from "@/src/components/marketing/Problem";
import { Features } from "@/src/components/marketing/Features";
import { Output } from "@/src/components/marketing/Output";
import { Pricing } from "@/src/components/marketing/Pricing";
import { FAQ } from "@/src/components/marketing/FAQ";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12 sm:gap-24">
      <Hero />
      <Problem />
      <Features />
      <Output />
      <Pricing />
      <FAQ />
    </div>
  );
}
