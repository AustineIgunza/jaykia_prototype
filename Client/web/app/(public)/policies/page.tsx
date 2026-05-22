import type { Metadata } from "next";
import { GoldDivider } from "@/components/ui/gold-divider";

export const metadata: Metadata = {
  title: "Policies",
  description: "JayKia customer policies \u2014 booking, cancellation, refund, payment, conduct, luggage, child safety, privacy, and more.",
};

const policies = [
  {
    title: "Booking Policy",
    content: [
      "Bookings can be made through our website or by contacting our team directly.",
      "A booking is confirmed once payment is received or a valid payment method is on file.",
      "Please provide accurate passenger details, flight information, and contact details at the time of booking.",
      "JayKia reserves the right to cancel a booking if inaccurate or incomplete information is provided.",
    ],
  },
  {
    title: "Cancellation & Refund Policy",
    content: [
      "Cancellations made more than 6 hours before the scheduled pickup time are eligible for a full refund.",
      "Cancellations made within 6 hours of the scheduled pickup time are not eligible for a refund.",
      "If JayKia cancels a trip for any reason, the client will receive a full refund.",
      "Refund requests are reviewed and processed within 3\u20135 business days.",
      "Refunds are issued to the original payment method.",
    ],
  },
  {
    title: "Payment Policy",
    content: [
      "We accept M-Pesa, credit/debit cards, and bank transfers.",
      "All prices are quoted in Kenyan Shillings (KES) and are inclusive of applicable taxes.",
      "Pricing is fixed at the time of booking \u2014 no surge pricing, no negotiations.",
      "International clients may pay via international card gateways (coming soon).",
      "Payment must be completed before or at the time of booking confirmation.",
    ],
  },
  {
    title: "Waiting Time Policy",
    content: [
      "For domestic flight arrivals: 30 minutes of complimentary waiting time from the scheduled arrival time.",
      "For international flight arrivals: 60 minutes of complimentary waiting time from the scheduled arrival time.",
      "Our team monitors flight status and adjusts pickup times for delayed flights at no extra charge.",
      "Waiting time beyond the complimentary period may incur additional charges.",
    ],
  },
  {
    title: "Passenger Conduct",
    content: [
      "Passengers are expected to behave respectfully towards drivers and other passengers.",
      "Smoking, consumption of alcohol, and illegal substances are strictly prohibited in all JayKia vehicles.",
      "JayKia reserves the right to terminate a trip if a passenger\u2019s conduct endangers the safety of the driver or other passengers.",
      "Any damage to the vehicle caused by a passenger will be charged to the passenger.",
    ],
  },
  {
    title: "Luggage Policy",
    content: [
      "Standard transfers accommodate up to 2 large suitcases and 1 carry-on per passenger.",
      "For excess or oversized luggage, please notify us at the time of booking so we can arrange an appropriate vehicle.",
      "JayKia is not liable for damage to fragile or improperly packed items.",
      "Any items left in the vehicle should be reported immediately (see Lost & Found policy).",
    ],
  },
  {
    title: "Child Safety Policy",
    content: [
      "Child seats are available on request at the time of booking.",
      "Please specify the child\u2019s age and weight so we can provide the appropriate seat type.",
      "Children under 8 years of age must use a child seat or booster as required by Kenyan traffic law.",
      "JayKia is not liable if a child seat is not requested at the time of booking.",
    ],
  },
  {
    title: "Privacy Policy",
    content: [
      "JayKia collects personal information solely for the purpose of providing our transfer services.",
      "Your data (name, contact details, flight information) is stored securely and never shared with third parties for marketing purposes.",
      "Payment information is processed through secure, PCI-compliant payment gateways.",
      "You may request deletion of your personal data by contacting us at any time.",
      "We may use anonymized booking data for analytics and service improvement.",
    ],
  },
  {
    title: "Lost & Found",
    content: [
      "If you leave an item in a JayKia vehicle, contact us as soon as possible with your booking reference.",
      "We will make reasonable efforts to locate and return your item.",
      "Items not claimed within 30 days may be disposed of.",
      "JayKia is not liable for items left in vehicles.",
    ],
  },
  {
    title: "Delays & Force Majeure",
    content: [
      "JayKia is not liable for delays caused by traffic, road closures, weather events, or other circumstances beyond our control.",
      "In the event of significant delays, we will communicate proactively and work to minimize disruption.",
      "If a trip cannot be completed due to force majeure, a full or partial refund may be issued at JayKia\u2019s discretion.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-sm uppercase tracking-[0.25em] text-accent mb-3 text-center">Legal</p>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
        Customer Policies
      </h1>
      <p className="text-muted text-center mb-12">
        Please review our policies below. By booking with JayKia, you agree to these terms.
      </p>

      <div className="space-y-10">
        {policies.map((policy) => (
          <section key={policy.title}>
            <h2 className="font-display text-xl font-semibold mb-4">{policy.title}</h2>
            <ul className="space-y-2">
              {policy.content.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-light leading-relaxed">
                  <span className="text-accent mt-0.5 shrink-0">&bull;</span>
                  {item}
                </li>
              ))}
            </ul>
            <GoldDivider className="mt-8" />
          </section>
        ))}
      </div>
    </div>
  );
}
