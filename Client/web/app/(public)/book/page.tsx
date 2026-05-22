"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/gold-divider";
import { useApi } from "@/lib/api/use-api";
import type { CreateBookingDTO, TransportMode, CreatePaymentDTO, PayMethod } from "@/lib/api/types";

type Step = "details" | "review" | "payment" | "confirmation";

const transportOptions = [
  { value: "flight", label: "Flight (Airport Transfer)" },
  { value: "road", label: "Road Transfer" },
  { value: "railway", label: "Railway Transfer" },
];

const paymentOptions = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "bank", label: "Bank Transfer" },
];

// Fixed pricing in KES — TODO: verify against backend / business rules
const PRICING: Record<string, number> = {
  "1": 3500,
  "2": 4500,
  "3": 5500,
  "4": 6500,
  default: 7500,
};

function getPrice(passengers: number): number {
  return PRICING[String(passengers)] ?? PRICING.default;
}

interface FormData {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pickup_location: string;
  drop_off_location: string;
  flight_number: string;
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
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");

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
    if (form.mode_of_transport === "flight" && !form.flight_arrival)
      errs.flight_arrival = "Arrival date & time is required";
    if (Number(form.no_of_passengers) < 1) errs.no_of_passengers = "At least 1 passenger";

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
        flight_arrival: form.flight_arrival || undefined,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        child_seat: form.child_seat,
        notes: form.notes || undefined,
      };
      const booking = await api.createBooking(dto);
      setBookingId(booking.id);
      setStep("payment");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!api || !bookingId) return;
    setLoading(true);
    try {
      const dto: CreatePaymentDTO = {
        booking_id: bookingId,
        amount: getPrice(Number(form.no_of_passengers)),
        payment_method: paymentMethod,
        phone_number: paymentMethod === "mpesa" ? mpesaPhone : undefined,
      };
      // TODO: for card payments, redirect to payment gateway
      // TODO: for bank transfers, show bank details
      await api.createPayment(dto);
      setStep("confirmation");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  const price = getPrice(Number(form.no_of_passengers));

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2">
        Book a Transfer
      </h1>
      <p className="text-muted text-center mb-10">
        Fill in your details and we&rsquo;ll confirm your executive airport transfer.
      </p>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {(["details", "review", "payment", "confirmation"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
                step === s
                  ? "bg-accent text-background border-accent"
                  : i < ["details", "review", "payment", "confirmation"].indexOf(step)
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-surface text-muted border-border"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

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
                  min="0"
                  max="20"
                  value={form.no_of_luggage_items}
                  onChange={(e) => update("no_of_luggage_items", e.target.value)}
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Total Price</span>
                <span className="font-display text-2xl font-bold text-accent">
                  KES {price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStep("details")}>
                Edit Details
              </Button>
              <Button loading={loading} onClick={handleSubmitBooking}>
                Confirm &amp; Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <Card>
          <CardContent>
            <h2 className="font-display text-xl font-semibold mb-6">Payment</h2>
            <p className="text-sm text-muted mb-6">
              Booking reference: <span className="font-mono text-accent">{bookingId}</span>
            </p>

            <div className="mb-6 p-4 bg-accent/10 rounded-[var(--radius-md)] border border-accent/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Amount Due</span>
                <span className="font-display text-2xl font-bold text-accent">
                  KES {price.toLocaleString()}
                </span>
              </div>
            </div>

            <Select
              label="Payment Method"
              options={paymentOptions}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PayMethod)}
            />

            {paymentMethod === "mpesa" && (
              <div className="mt-4">
                <Input
                  label="M-Pesa Phone Number"
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  required
                />
                <p className="mt-2 text-xs text-muted">
                  You&rsquo;ll receive an M-Pesa STK push to confirm payment.
                </p>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mt-4 p-4 bg-surface border border-border rounded-[var(--radius-md)]">
                <p className="text-sm text-muted">
                  {/* TODO: integrate payment gateway (Stripe / Flutterwave / Paystack) */}
                  Card payment gateway integration coming soon. You will be redirected to a secure payment page.
                </p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="mt-4 p-4 bg-surface border border-border rounded-[var(--radius-md)] text-sm text-muted space-y-1">
                {/* TODO: replace with real bank details */}
                <p className="font-semibold text-foreground">Bank Transfer Details</p>
                <p>Bank: Kenya Commercial Bank (KCB)</p>
                <p>Account Name: JayKia Executive Transfers Ltd</p>
                <p>Account Number: 123-456-7890</p>
                <p>Branch: Westlands, Nairobi</p>
                <p className="mt-2 text-xs">
                  Please use your booking reference (<span className="font-mono text-accent">{bookingId}</span>) as the payment reference.
                </p>
              </div>
            )}

            <div className="pt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStep("review")}>
                Back
              </Button>
              <Button loading={loading} onClick={handlePayment}>
                {paymentMethod === "mpesa"
                  ? "Pay with M-Pesa"
                  : paymentMethod === "card"
                    ? "Pay with Card"
                    : "I\u2019ve Made the Transfer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Confirmation */}
      {step === "confirmation" && (
        <Card>
          <CardContent className="text-center py-10">
            <div className="text-5xl mb-4">&#10003;</div>
            <h2 className="font-display text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted mb-4">
              Your booking reference is{" "}
              <span className="font-mono text-accent font-semibold">{bookingId}</span>
            </p>
            <p className="text-sm text-muted max-w-md mx-auto mb-2">
              We&rsquo;ll send a confirmation to <strong className="text-foreground">{form.contact_email}</strong>.
              Our driver will arrive 15&ndash;30 minutes before your pickup time.
            </p>
            <p className="text-sm text-muted max-w-md mx-auto mb-8">
              <strong className="text-foreground">Waiting time policy:</strong> 30 minutes for domestic flights, 60 minutes for international flights &mdash; at no extra charge.
            </p>
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
    </div>
  );
}
