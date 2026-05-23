import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "Services",
  description: "Premium airport transfer services at JKIA, Nairobi. Executive sedans, SUVs, and luxury vans.",
};

const services = [
  {
    title: "Airport Arrival Pickup",
    desc: "We meet you at JKIA arrivals with a name board, help with luggage, and drive you to your destination in a premium vehicle. Our drivers arrive 15\u201330 minutes early and track your flight in real time.",
    features: ["Flight tracking", "Meet & greet at arrivals", "Luggage assistance", "Complimentary SIM card"],
  },
  {
    title: "Airport Departure Drop-off",
    desc: "Punctual pickup from your hotel or residence to JKIA. We ensure you arrive at the airport with plenty of time, stress-free.",
    features: ["On-time guarantee", "Hotel/residence pickup", "Route planning for traffic", "Flight check-in reminders"],
  },
  {
    title: "Executive Transfers",
    desc: "Premium road transfers across Nairobi and beyond for business meetings, conferences, or inter-city travel.",
    features: ["Professional uniformed chauffeurs", "Air-conditioned vehicles", "Wi-Fi available", "Flexible scheduling"],
  },
  {
    title: "Group & Family Transfers",
    desc: "Spacious SUVs and luxury vans for families and groups. Child seats available on request.",
    features: ["Vehicles for up to 8 passengers", "Child seat provision", "Extra luggage capacity", "Door-to-door service"],
  },
];

const extras = [
  {
    title: "Kenyan SIM Cards",
    desc: "Stay connected from the moment you land. We provide a complimentary local SIM card pre-loaded with data so you can call, text, and browse right away.",
  },
  {
    title: "Foreign Currency Guidance",
    desc: "Need Kenyan Shillings? We\u2019ll direct you to trusted forex bureaus with fair rates\u2014no tourist traps, no haggling.",
  },
  {
    title: "Shopping & Sightseeing Tips",
    desc: "From the Maasai Market to Westgate Mall and Sarit Centre, our drivers share insider knowledge on where to find authentic crafts, fashion, and souvenirs.",
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <FadeIn direction="none">
          <p className="text-sm uppercase tracking-[0.25em] text-accent mb-3">Our Services</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto mb-4">
            Premium transfers, not just a ride
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-muted max-w-xl mx-auto">
            Every JayKia transfer is a complete experience&mdash;from the moment you land to the moment you arrive at your destination.
          </p>
        </FadeIn>
      </section>

      <GoldDivider />

      {/* Core Services */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.12}>
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <Card hover>
                <CardContent>
                  <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{s.desc}</p>
                  <ul className="space-y-1">
                    {s.features.map((f) => (
                      <li key={f} className="text-sm text-muted-light flex items-start gap-2">
                        <span className="text-accent mt-0.5">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <GoldDivider />

      {/* Extras */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold text-center mb-4">
              The JayKia Extras
            </h2>
            <p className="text-muted text-center max-w-xl mx-auto mb-12">
              Complimentary add-ons that set us apart from every other transfer service.
            </p>
          </FadeIn>
          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
            {extras.map((e) => (
              <StaggerItem key={e.title}>
                <Card>
                  <CardContent>
                    <h3 className="font-display text-lg font-semibold text-accent mb-2">{e.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{e.desc}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <GoldDivider />

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold mb-4">Ready to experience JayKia?</h2>
          <p className="text-muted max-w-md mx-auto mb-8">
            Book your premium airport transfer in under two minutes.
          </p>
          <Link href="/book">
            <Button size="lg">Book a Transfer</Button>
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
