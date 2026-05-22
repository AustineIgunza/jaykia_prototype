import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/ui/gold-divider";
import { Card, CardContent } from "@/components/ui/card";

const valueProps = [
  {
    title: "Fixed Pricing",
    desc: "Know your fare before you book. No surge, no negotiation, no surprises.",
    icon: "KES",
  },
  {
    title: "Professional Drivers",
    desc: "Uniformed, vetted chauffeurs who know Nairobi and treat every client like a VIP.",
    icon: "\u{1F454}",
  },
  {
    title: "Always Early",
    desc: "We arrive 15\u201330 minutes before your pickup time. Your schedule, not ours.",
    icon: "\u23F0",
  },
  {
    title: "Branded Vehicles",
    desc: "Clean, premium, air-conditioned fleet maintained to executive standards.",
    icon: "\u{1F698}",
  },
];

const extras = [
  {
    title: "Kenyan SIM Cards",
    desc: "Stay connected from the moment you land. Complimentary local SIM with data.",
  },
  {
    title: "Foreign Currency Help",
    desc: "We\u2019ll guide you to the best forex bureaus so you get a fair rate, hassle-free.",
  },
  {
    title: "Shopping Advice",
    desc: "From Westgate and Sarit Centre to the Maasai Market\u2014insider tips on where to shop.",
  },
];

const testimonials = [
  {
    name: "James M.",
    rating: 5,
    text: "Exceptional service! Driver was waiting right at arrivals, car was spotless, and the complimentary SIM card was a brilliant touch.",
  },
  {
    name: "Michael B.",
    rating: 4,
    text: "Very professional. The driver helped with all luggage. Would have been 5 stars but the car AC was a bit slow to cool.",
  },
  {
    name: "Amina H.",
    rating: 5,
    text: "Even though our flight was cancelled, JayKia handled the refund swiftly. Will definitely book again.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-accent" aria-label={`${count} out of 5 stars`}>
      {"\u2605".repeat(count)}
      {"\u2606".repeat(5 - count)}
    </span>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 md:py-44 overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface -z-10" />
        <p className="text-sm uppercase tracking-[0.25em] text-accent mb-4 animate-fade-in">
          Executive Airport Transfers &mdash; JKIA, Nairobi
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl animate-slide-up">
          Arrive happy, travel free
        </h1>
        <p className="mt-6 text-muted-light text-lg md:text-xl max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Fixed pricing, professional uniformed drivers, branded vehicles.
          We are not a taxi, not a rideshare&mdash;we are your personal airport transfer service.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link href="/book">
            <Button size="lg">Book a Transfer</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="lg">
              Our Services
            </Button>
          </Link>
        </div>
      </section>

      <GoldDivider />

      {/* Value Propositions */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">
          Why JayKia?
        </h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-12">
          We built JayKia for travellers who value punctuality, comfort, and transparency above all else.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((vp) => (
            <Card key={vp.title} hover>
              <CardContent>
                <div className="text-3xl mb-4">{vp.icon}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{vp.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{vp.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* Fleet Preview */}
      <section className="px-6 py-20 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">
            Our Fleet
          </h2>
          <p className="text-muted text-center max-w-xl mx-auto mb-12">
            Executive sedans and SUVs maintained to the highest standard. Every vehicle is air-conditioned, immaculate, and comfortable.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Executive Sedan", "Premium SUV", "Luxury Van"].map((vehicle) => (
              <div
                key={vehicle}
                className="aspect-[16/10] rounded-[var(--radius-lg)] bg-background border border-border flex items-center justify-center"
              >
                {/* TODO: replace with real photography */}
                <div className="text-center p-6">
                  <div className="text-4xl mb-3 text-muted">&#128663;</div>
                  <p className="font-display text-lg font-semibold">{vehicle}</p>
                  <p className="text-xs text-muted mt-1">Photo coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* Signature Extras */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">
          The JayKia Extras
        </h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-12">
          Small touches that make a big difference, especially if you&rsquo;re visiting Kenya for the first time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {extras.map((extra) => (
            <Card key={extra.title} hover>
              <CardContent>
                <h3 className="font-display text-lg font-semibold mb-2 text-accent">
                  {extra.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{extra.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* Social Proof / Testimonials */}
      <section className="px-6 py-20 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-12">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent>
                  <StarRating count={t.rating} />
                  <p className="mt-3 text-sm text-muted-light leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-semibold text-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* Final CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
          Ready for a better airport experience?
        </h2>
        <p className="text-muted max-w-lg mx-auto mb-8">
          Book your executive JKIA transfer in under two minutes. Fixed pricing, no hidden fees.
        </p>
        <Link href="/book">
          <Button size="lg">Book a Transfer</Button>
        </Link>
      </section>
    </div>
  );
}
