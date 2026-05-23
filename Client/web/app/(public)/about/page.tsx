import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about JayKia — Nairobi's premium executive airport transfer service.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <FadeIn direction="none">
          <p className="text-sm uppercase tracking-[0.25em] text-accent mb-3">About JayKia</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto mb-4">
            We are not a taxi
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-muted max-w-xl mx-auto">
            JayKia was built from the belief that arriving at your destination should feel as good as the trip itself.
          </p>
        </FadeIn>
      </section>

      <GoldDivider />

      {/* Story */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-2xl font-semibold mb-6">Our Story</h2>
        </FadeIn>
        <Stagger className="space-y-4 text-muted-light leading-relaxed" staggerDelay={0.15}>
          <StaggerItem>
            <p>
              JayKia was founded in Nairobi with a simple mission: to provide executive-grade airport transfers that travellers can trust completely. We saw an industry dominated by unpredictable pricing, unreliable drivers, and vehicles that didn&rsquo;t meet the standard busy professionals and international visitors deserve.
            </p>
          </StaggerItem>
          <StaggerItem>
            <p>
              We set out to change that. Every JayKia transfer is fixed-price, on-time, and delivered by a uniformed professional driver in a branded, immaculate vehicle. No negotiations, no surprises, no stress.
            </p>
          </StaggerItem>
          <StaggerItem>
            <p>
              Based at Jomo Kenyatta International Airport (JKIA), we serve Nairobi and surrounding areas with a growing fleet of executive sedans, premium SUVs, and luxury vans. Our drivers don&rsquo;t just drive&mdash;they welcome you to Kenya with local knowledge, complimentary SIM cards, and genuine hospitality.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      <GoldDivider />

      {/* Mission & Vision */}
      <section className="px-6 py-16 bg-surface">
        <Stagger className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12" staggerDelay={0.2}>
          <StaggerItem>
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4 text-accent">Our Mission</h2>
              <p className="text-muted-light leading-relaxed">
                To deliver Kenya&rsquo;s most reliable, comfortable, and transparent airport transfer service&mdash;so every client arrives happy and stress-free.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4 text-accent">Our Vision</h2>
              <p className="text-muted-light leading-relaxed">
                To become East Africa&rsquo;s most trusted executive transfer brand, known for punctuality, professionalism, and a genuine commitment to client satisfaction.
              </p>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      <GoldDivider />

      {/* Values */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-2xl font-semibold mb-8 text-center">What We Stand For</h2>
        </FadeIn>
        <Stagger className="space-y-6" staggerDelay={0.12}>
          {[
            { title: "Punctuality", desc: "We arrive 15\u201330 minutes early. Your time is valuable and we respect it." },
            { title: "Transparency", desc: "Fixed pricing, no hidden fees, no surge. What we quote is what you pay." },
            { title: "Professionalism", desc: "Uniformed drivers, branded vehicles, impeccable service\u2014every time." },
            { title: "Hospitality", desc: "SIM cards, currency guidance, shopping tips\u2014we go beyond the ride." },
          ].map((v) => (
            <StaggerItem key={v.title}>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted">{v.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <GoldDivider />

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold mb-4">Experience the JayKia difference</h2>
          <Link href="/book">
            <Button size="lg">Book a Transfer</Button>
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
