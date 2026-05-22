"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldDivider } from "@/components/ui/gold-divider";
import { useApi } from "@/lib/api/use-api";
import type { Booking } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  ongoing: "info",
  complete: "success",
};

export default function BookingTrackingPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const api = useApi();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    api
      .getBooking(ref)
      .then(setBooking)
      .catch((err) => setError(err instanceof Error ? err.message : "Booking not found"))
      .finally(() => setLoading(false));
  }, [api, ref]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted animate-pulse">Loading booking&hellip;</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Booking Not Found</h1>
        <p className="text-muted">
          We couldn&rsquo;t find a booking with reference <span className="font-mono text-accent">{ref}</span>.
          Please check the reference and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2">
        Booking Details
      </h1>
      <p className="text-muted text-center mb-10">
        Reference: <span className="font-mono text-accent">{booking.id}</span>
      </p>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Trip Status</h2>
            <StatusBadge variant={booking.cancelled ? "error" : statusVariant[booking.trip_status]}>
              {booking.cancelled ? "Cancelled" : booking.trip_status.charAt(0).toUpperCase() + booking.trip_status.slice(1)}
            </StatusBadge>
          </div>

          <dl className="space-y-3 text-sm">
            {[
              ["Pickup", booking.pickup_location],
              ["Drop-off", booking.drop_off_location],
              ["Transport", booking.mode_of_transport],
              ...(booking.flight_number ? [["Flight", booking.flight_number]] : []),
              ...(booking.flight_arrival
                ? [["Arrival", new Date(booking.flight_arrival).toLocaleString()]]
                : []),
              ["Passengers", String(booking.no_of_passengers)],
              ["Luggage", String(booking.no_of_luggage_items)],
              ...(booking.contact_name ? [["Contact", booking.contact_name]] : []),
              ...(booking.contact_phone ? [["Phone", booking.contact_phone]] : []),
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted">{label}</dt>
                <dd className="text-foreground font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          {booking.cancelled && booking.reason && (
            <>
              <GoldDivider className="my-4" />
              <div className="p-3 bg-error/10 border border-error/20 rounded-[var(--radius-md)]">
                <p className="text-sm text-error">
                  <strong>Cancellation reason:</strong> {booking.reason}
                </p>
              </div>
            </>
          )}

          <GoldDivider className="my-4" />

          <div className="p-4 bg-surface border border-border rounded-[var(--radius-md)] text-sm text-muted">
            <p className="font-semibold text-foreground mb-2">Waiting Time Policy</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Domestic flights: 30 minutes complimentary waiting time</li>
              <li>International flights: 60 minutes complimentary waiting time</li>
              <li>Our driver will track your flight and adjust accordingly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
