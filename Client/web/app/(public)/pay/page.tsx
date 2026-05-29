"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn } from "@/components/motion";
import { useAuth } from "@/lib/auth/context";
import { useApi } from "@/lib/api/use-api";
import type { Booking } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  ongoing: "info",
  complete: "success",
};

export default function PayPage() {
  const { user, loading: authLoading } = useAuth();
  const api = useApi();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!api || !user) return;
    api
      .getMyBookings()
      .then((all) => {
        const payable = all.filter((b) => !b.cancelled);
        setBookings(payable);
        const pre = new URLSearchParams(window.location.search).get("booking");
        if (pre && payable.some((b) => b.id === pre)) {
          setSelectedId(pre);
        } else if (payable.length === 1) {
          setSelectedId(payable[0].id);
        }
      })
      .finally(() => setLoadingBookings(false));
  }, [api, user]);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  async function handlePay() {
    if (!api) return;
    setError("");
    if (!selectedId) {
      setError("Select a booking to pay for");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) {
      setError("Enter a valid amount in KES");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.initiatePaystack({ bookingId: selectedId, amount: amt });
      const url = res?.data?.authorization_url;
      if (!url) throw new Error(res?.message || "Could not start payment");
      // Hand off to Paystack's secure checkout.
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be started");
      setSubmitting(false);
    }
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
          <h1 className="font-display text-3xl font-bold mb-3">Sign in to pay</h1>
          <p className="text-muted mb-8">
            You need a JayKia account to pay for a booking and track your trips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/auth/login?returnTo=/pay")}>Sign In</Button>
            <Button variant="outline" onClick={() => router.push("/auth/register?returnTo=/pay")}>
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
          Make a Payment
        </h1>
        <p className="text-muted text-center mb-10">
          Pay securely for your airport transfer with card or bank via Paystack.
        </p>

        {loadingBookings ? (
          <p className="text-muted text-center animate-pulse">Loading your bookings&hellip;</p>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted mb-4">You have no bookings to pay for yet.</p>
              <Button onClick={() => router.push("/book")}>Book a Transfer</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="space-y-5">
                <Select
                  label="Booking"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  options={[
                    { value: "", label: "Select a booking…" },
                    ...bookings.map((b) => ({
                      value: b.id,
                      label: `${b.pickup_location} → ${b.drop_off_location}`,
                    })),
                  ]}
                />

                {selected && (
                  <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted">{selected.id}</span>
                      <StatusBadge variant={statusVariant[selected.trip_status]}>
                        {selected.trip_status.charAt(0).toUpperCase() + selected.trip_status.slice(1)}
                      </StatusBadge>
                    </div>
                    <p className="font-medium">
                      {selected.pickup_location} &rarr; {selected.drop_off_location}
                    </p>
                    <p className="text-muted mt-1">
                      {selected.no_of_passengers} passenger
                      {selected.no_of_passengers > 1 ? "s" : ""}
                      {selected.flight_number ? ` · Flight ${selected.flight_number}` : ""}
                    </p>
                  </div>
                )}

                <Input
                  label="Amount (KES)"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="Enter the amount you were quoted"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={error && !amount ? error : undefined}
                />

                {error && amount ? <p className="text-sm text-error">{error}</p> : null}

                <Button
                  className="w-full"
                  loading={submitting}
                  disabled={!selectedId || !amount}
                  onClick={handlePay}
                >
                  Pay with Paystack
                </Button>

                <GoldDivider />

                <p className="text-xs text-muted text-center">
                  You&rsquo;ll be redirected to Paystack&rsquo;s secure checkout to complete your
                  payment. JayKia never sees or stores your card details.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </FadeIn>
    </div>
  );
}
