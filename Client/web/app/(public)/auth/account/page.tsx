"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldDivider } from "@/components/ui/gold-divider";
import { Modal } from "@/components/ui/modal";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { useAuth } from "@/lib/auth/context";
import { useApi } from "@/lib/api/use-api";
import type { Booking } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  ongoing: "info",
  complete: "success",
};

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const api = useApi();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating modal
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingValue, setRatingValue] = useState("5");
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  // Refund modal
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!api || !user) return;
    api
      .getMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [api, user]);

  async function submitRating() {
    if (!api || !ratingBooking) return;
    setRatingLoading(true);
    try {
      await api.createRating({
        booking_id: ratingBooking.id,
        rating: Number(ratingValue),
        comments: ratingComment || undefined,
      });
      setRatingBooking(null);
      setRatingComment("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  }

  async function submitRefund() {
    if (!api || !refundBooking) return;
    setRefundLoading(true);
    try {
      await api.createRefund({
        booking_id: refundBooking.id,
        reason: refundReason,
      });
      setRefundBooking(null);
      setRefundReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit refund request");
    } finally {
      setRefundLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted animate-pulse">Loading&hellip;</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Account</h1>
            <p className="text-sm text-muted mt-1">Manage your bookings and account</p>
          </div>
          <Button variant="ghost" onClick={logout}>
            Sign Out
          </Button>
        </div>

        <GoldDivider />

        <h2 className="font-display text-xl font-semibold mb-6">Booking History</h2>
      </FadeIn>

      {loading ? (
        <p className="text-muted animate-pulse">Loading bookings&hellip;</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted mb-4">No bookings yet.</p>
            <Button onClick={() => router.push("/book")}>Book Your First Transfer</Button>
          </CardContent>
        </Card>
      ) : (
        <Stagger className="space-y-4" staggerDelay={0.08}>
          {bookings.map((booking) => (
            <StaggerItem key={booking.id}>
            <Card key={booking.id}>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono text-xs text-muted">{booking.id}</p>
                    <p className="font-semibold">
                      {booking.pickup_location} &rarr; {booking.drop_off_location}
                    </p>
                  </div>
                  <StatusBadge variant={booking.cancelled ? "error" : statusVariant[booking.trip_status]}>
                    {booking.cancelled ? "Cancelled" : booking.trip_status.charAt(0).toUpperCase() + booking.trip_status.slice(1)}
                  </StatusBadge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                  {booking.flight_number && <span>Flight: {booking.flight_number}</span>}
                  <span>{booking.no_of_passengers} passenger{booking.no_of_passengers > 1 ? "s" : ""}</span>
                  {booking.created_at && (
                    <span>Booked: {new Date(booking.created_at).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/booking/${booking.id}`)}
                  >
                    View Details
                  </Button>
                  {booking.trip_status === "complete" && !booking.cancelled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRatingBooking(booking)}
                    >
                      Leave a Rating
                    </Button>
                  )}
                  {!booking.cancelled && booking.trip_status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRefundBooking(booking)}
                    >
                      Request Refund
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Rating Modal */}
      <Modal
        open={!!ratingBooking}
        onClose={() => setRatingBooking(null)}
        title="Rate Your Trip"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            How was your trip from{" "}
            <strong className="text-foreground">{ratingBooking?.pickup_location}</strong> to{" "}
            <strong className="text-foreground">{ratingBooking?.drop_off_location}</strong>?
          </p>
          <div>
            <label className="text-sm text-muted-light block mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRatingValue(String(n))}
                  className={`text-2xl cursor-pointer transition-colors ${
                    n <= Number(ratingValue) ? "text-accent" : "text-border"
                  }`}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  &#9733;
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Comments (optional)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Tell us about your experience..."
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRatingBooking(null)}>
              Cancel
            </Button>
            <Button loading={ratingLoading} onClick={submitRating}>
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal
        open={!!refundBooking}
        onClose={() => setRefundBooking(null)}
        title="Request a Refund"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Cancellations more than <strong className="text-foreground">6 hours</strong> before pickup qualify for a full refund.
            Cancellations within 6 hours are not eligible.
          </p>
          <Input
            label="Booking Reference"
            value={refundBooking?.id || ""}
            disabled
          />
          <Textarea
            label="Reason for Refund"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Please explain why you're requesting a refund..."
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRefundBooking(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={refundLoading}
              onClick={submitRefund}
              disabled={!refundReason.trim()}
            >
              Submit Refund Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
