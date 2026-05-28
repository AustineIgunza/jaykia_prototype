"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import { useAuth } from "@/lib/auth/context";
import type { CreateBookingDTO, TransportMode } from "@/lib/api/types";

type Step = "details" | "review" | "confirmation";

const transportOptions = [
  { value: "flight", label: "Flight (Airport Transfer)" },
  { value: "road", label: "Road Transfer" },
  { value: "railway", label: "Railway Transfer" },
];

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+254700000000";

interface FormData {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pickup_location: string;
  drop_off_location: string;
  flight_number: string;
  flight_departure: string;
  flight_arrival: string;
  no_of_passengers: string;
  no_of_luggage_items: string;
  mode_of_transport: TransportMode;
  child_seat: boolean;
  notes: string;
}

const initial: FormData = {
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  pickup_location: "",
  drop_off_location: "",
  flight_number: "",
  flight_departure: "",
  flight_arrival: "",
  no_of_passengers: "1",
  no_of_luggage_items: "1",
  mode_of_transport: "flight",
  child_seat: false,
  notes: "",
};

export default function BookPage() {
  const api = useApi();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.contact_name.trim()) errs.contact_name = "Full name is required";
    if (!form.contact_phone.trim()) errs.contact_phone = "Phone number is required";
    if (!form.contact_email.trim()) errs.contact_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      errs.contact_email = "Invalid email";
    if (!form.pickup_location.trim()) errs.pickup_location = "Pickup location is required";
    if (!form.drop_off_location.trim()) errs.drop_off_location = "Drop-off location is required";
    if (form.mode_of_transport === "flight" && !form.flight_number.trim())
      errs.flight_number = "Flight number is required for airport transfers";
    if (form.mode_of_transport === "flight" && !form.flight_departure)
      errs.flight_departure = "Departure date & time is required";
    if (form.mode_of_transport === "flight" && !form.flight_arrival)
      errs.flight_arrival = "Arrival date & time is required";
    if (Number(form.no_of_passengers) < 1) errs.no_of_passengers = "At least 1 passenger";
    if (Number(form.no_of_luggage_items) < 1) errs.no_of_luggage_items = "At least 1 luggage item";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmitBooking() {
    if (!api) return;
    setLoading(true);
    try {
      const dto: CreateBookingDTO = {
        pickup_location: form.pickup_location,
        drop_off_location: form.drop_off_location,
        no_of_passengers: Number(form.no_of_passengers),
        no_of_luggage_items: Number(form.no_of_luggage_items),
        mode_of_transport: form.mode_of_transport,
        flight_number: form.flight_number || undefined,
        flight_departure: form.flight_departure || undefined,
        flight_arrival: form.flight_arrival || undefined,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        child_seat: form.child_seat,
        notes: form.notes || undefined,
      };
      const booking = await api.createBooking(dto);
      setBookingId(booking.id);
      setStep("confirmation");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  function buildWhatsAppUrl() {
    const msg = [
      `Hi JayKia! I just submitted a booking (Ref: ${bookingId}).`,
      ``,
      `Name: ${form.contact_name}`,
      `Pickup: ${form.pickup_location}`,
      `Drop-off: ${form.drop_off_location}`,
      `Passengers: ${form.no_of_passengers}`,
      form.flight_number ? `Flight: ${form.flight_number}` : "",
      form.flight_departure ? `Departure: ${form.flight_departure}` : "",
      form.flight_arrival ? `Arrival: ${form.flight_arrival}` : "",
      ``,
      `I'd like to discuss the quote. Thank you!`,
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`;
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-muted animate-pulse">Loading&hellip;</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold mb-3">Sign in to book</h1>
          <p className="text-muted mb-8">
            Booking a transfer requires a JayKia account so you can track your
            trips and manage your bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/auth/login?returnTo=/book")}>
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/register?returnTo=/book")}
            >
              Create Account
            </Button>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <FadeIn>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2">
          Book a Transfer
        </h1>
        <p className="text-muted text-center mb-10">
          Fill in your details and we&rsquo;ll confirm your executive airport transfer.
        </p>
      </FadeIn>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {(["details", "review", "confirmation"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-300 ${
                step === s
                  ? "bg-accent text-background border-accent"
                  : i < ["details", "review", "confirmation"].indexOf(step)
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-surface text-muted border-border"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >

      {/* Step: Details */}
      {step === "details" && (
        <Card>
          <CardContent>
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold mb-4">Passenger Details</h2>
              <Input
                label="Full Name"
                value={form.contact_name}
                onChange={(e) => update("contact_name", e.target.value)}
                error={errors.contact_name}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => update("contact_phone", e.target.value)}
                  error={errors.contact_phone}
                  placeholder="+254 7XX XXX XXX"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                  error={errors.contact_email}
                  required
                />
              </div>

              <GoldDivider className="my-6" />

              <h2 className="font-display text-xl font-semibold mb-4">Trip Details</h2>
              <Select
                label="Mode of Transport"
                options={transportOptions}
                value={form.mode_of_transport}
                onChange={(e) => update("mode_of_transport", e.target.value as TransportMode)}
              />
              <Input
                label="Pickup Location"
                value={form.pickup_location}
                onChange={(e) => update("pickup_location", e.target.value)}
                error={errors.pickup_location}
                placeholder="e.g. JKIA Terminal 1A"
                required
              />
              <Input
                label="Drop-off Location"
                value={form.drop_off_location}
                onChange={(e) => update("drop_off_location", e.target.value)}
                error={errors.drop_off_location}
                placeholder="e.g. Radisson Blu Hotel, Upper Hill"
                required
              />

              {form.mode_of_transport === "flight" && (
                <>
                  <Input
                    label="Flight Number"
                    value={form.flight_number}
                    onChange={(e) => update("flight_number", e.target.value)}
                    error={errors.flight_number}
                    placeholder="e.g. KQ 100"
                    required
                  />
                  <Input
                    label="Departure Date & Time"
                    type="datetime-local"
                    value={form.flight_departure}
                    onChange={(e) => update("flight_departure", e.target.value)}
                    error={errors.flight_departure}
                    required
                  />
                  <Input
                    label="Arrival Date & Time"
                    type="datetime-local"
                    value={form.flight_arrival}
                    onChange={(e) => update("flight_arrival", e.target.value)}
                    error={errors.flight_arrival}
                    required
                  />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Number of Passengers"
                  type="number"
                  min="1"
                  max="10"
                  value={form.no_of_passengers}
                  onChange={(e) => update("no_of_passengers", e.target.value)}
                  error={errors.no_of_passengers}
                />
                <Input
                  label="Number of Luggage Items"
                  type="number"
                  min="1"
                  max="20"
                  value={form.no_of_luggage_items}
                  onChange={(e) => update("no_of_luggage_items", e.target.value)}
                  error={errors.no_of_luggage_items}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.child_seat}
                  onChange={(e) => update("child_seat", e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm text-muted-light">I need a child seat</span>
              </label>

              <Textarea
                label="Additional Notes (optional)"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any special requests or instructions..."
              />

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (validate()) setStep("review");
                  }}
                >
                  Review Booking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <Card>
          <CardContent>
            <h2 className="font-display text-xl font-semibold mb-6">Review Your Booking</h2>
            <dl className="space-y-3 text-sm">
              {[
                ["Name", form.contact_name],
                ["Phone", form.contact_phone],
                ["Email", form.contact_email],
                ["Pickup", form.pickup_location],
                ["Drop-off", form.drop_off_location],
                ["Transport", form.mode_of_transport],
                ...(form.mode_of_transport === "flight"
                  ? [
                      ["Flight", form.flight_number],
                      ["Departure", form.flight_departure],
                      ["Arrival", form.flight_arrival],
                    ]
                  : []),
                ["Passengers", form.no_of_passengers],
                ["Luggage", form.no_of_luggage_items],
                ["Child Seat", form.child_seat ? "Yes" : "No"],
                ...(form.notes ? [["Notes", form.notes]] : []),
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-foreground font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 p-4 bg-accent/10 rounded-[var(--radius-md)] border border-accent/20">
              <p className="text-sm text-muted">
                After confirming, your booking details will be sent to your email. You can then discuss your quote directly with our team via WhatsApp.
              </p>
            </div>

            <div className="pt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStep("details")}>
                Edit Details
              </Button>
              <Button loading={loading} onClick={handleSubmitBooking}>
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Confirmation */}
      {step === "confirmation" && (
        <Card>
          <CardContent className="text-center py-10">
            <div className="text-5xl mb-4 text-success">&#10003;</div>
            <h2 className="font-display text-2xl font-bold mb-2">Booking Submitted!</h2>
            <p className="text-muted mb-4">
              Your booking reference is{" "}
              <span className="font-mono text-accent font-semibold">{bookingId}</span>
            </p>
            <p className="text-sm text-muted max-w-md mx-auto mb-2">
              Booking details have been sent to <strong className="text-foreground">{form.contact_email}</strong> and our team.
            </p>
            <p className="text-sm text-muted max-w-md mx-auto mb-2">
              To get your quote, reach out to us on WhatsApp. Our team will confirm pricing and next steps.
            </p>
            <p className="text-sm text-muted max-w-md mx-auto mb-8">
              <strong className="text-foreground">Waiting time policy:</strong> 30 minutes for domestic flights, 60 minutes for international flights &mdash; at no extra charge.
            </p>

            {/* WhatsApp CTA */}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-[var(--radius-md)] transition-colors mb-6"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp for Your Quote
            </a>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/booking/${bookingId}`)}
              >
                Track Booking
              </Button>
              <Button onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      </motion.div>
      </AnimatePresence>
    </div>
  );
}
