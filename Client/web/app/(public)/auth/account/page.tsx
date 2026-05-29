"use client";

import { useEffect, useState, useRef } from "react";
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
import type { Booking, UpdateBookingDTO } from "@/lib/api/types";
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

  // Edit booking modal
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    pickup_location: "",
    drop_off_location: "",
    no_of_passengers: "",
    no_of_luggage_items: "",
    flight_number: "",
    flight_arrival: "",
    notes: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // 2FA state
  const [twoFaStep, setTwoFaStep] = useState<"idle" | "setup" | "verify" | "backup" | "disable">("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFaCode, setTwoFaCode] = useState(["", "", "", "", "", ""]);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const twoFaRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function startSetup2FA() {
    if (!api) return;
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const res = await api.setup2FA();
      setQrCodeUrl(res.qrCodeUrl);
      setSecret(res.secret);
      setTwoFaStep("setup");
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Failed to start 2FA setup");
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function confirmSetup2FA() {
    if (!api) return;
    const code = twoFaCode.join("");
    if (code.length !== 6) { setTwoFaError("Enter all 6 digits"); return; }
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const res = await api.verifySetup2FA(code);
      setBackupCodes(res.backupCodes);
      setTwoFaEnabled(true);
      setTwoFaStep("backup");
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Invalid code");
      setTwoFaCode(["", "", "", "", "", ""]);
      twoFaRefs.current[0]?.focus();
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function disable2FA() {
    if (!api) return;
    const code = twoFaCode.join("");
    if (code.length !== 6) { setTwoFaError("Enter all 6 digits"); return; }
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      await api.disable2FA(code);
      setTwoFaEnabled(false);
      setTwoFaStep("idle");
      setTwoFaCode(["", "", "", "", "", ""]);
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setTwoFaLoading(false);
    }
  }

  function handleTwoFaInput(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;
    const next = [...twoFaCode];
    next[index] = value;
    setTwoFaCode(next);
    if (value && index < 5) twoFaRefs.current[index + 1]?.focus();
  }

  function handleTwoFaKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !twoFaCode[index] && index > 0) {
      twoFaRefs.current[index - 1]?.focus();
    }
  }

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

  function openEditModal(booking: Booking) {
    setEditBooking(booking);
    setEditForm({
      pickup_location: booking.pickup_location,
      drop_off_location: booking.drop_off_location,
      no_of_passengers: String(booking.no_of_passengers),
      no_of_luggage_items: String(booking.no_of_luggage_items),
      flight_number: booking.flight_number || "",
      flight_arrival: booking.flight_arrival || "",
      notes: booking.notes || "",
    });
  }

  async function submitEdit() {
    if (!api || !editBooking) return;
    setEditLoading(true);
    try {
      const dto: UpdateBookingDTO = {
        pickup_location: editForm.pickup_location,
        drop_off_location: editForm.drop_off_location,
        no_of_passengers: Number(editForm.no_of_passengers),
        no_of_luggage_items: Number(editForm.no_of_luggage_items),
        flight_number: editForm.flight_number || undefined,
        flight_arrival: editForm.flight_arrival || undefined,
        notes: editForm.notes || undefined,
      };
      const updated = await api.updateBooking(editBooking.id, dto);
      setBookings((prev) =>
        prev.map((b) => (b.id === editBooking.id ? updated : b))
      );
      setEditBooking(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setEditLoading(false);
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

        {/* ─── Security Settings / 2FA ─── */}
        <h2 className="font-display text-xl font-semibold mb-4 mt-8">Security</h2>

        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-muted">
                  {twoFaEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              {twoFaStep === "idle" && (
                twoFaEnabled ? (
                  <Button variant="outline" size="sm" onClick={() => { setTwoFaStep("disable"); setTwoFaCode(["","","","","",""]); setTwoFaError(""); }}>
                    Disable 2FA
                  </Button>
                ) : (
                  <Button size="sm" loading={twoFaLoading} onClick={startSetup2FA}>
                    Enable 2FA
                  </Button>
                )
              )}
            </div>

            {/* Setup step — QR code */}
            {twoFaStep === "setup" && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted mb-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex flex-col items-center gap-4 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="rounded-[var(--radius-md)] bg-white p-2"
                  />
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">Or enter this code manually:</p>
                    <code className="text-sm font-mono text-accent bg-surface px-3 py-1 rounded-[var(--radius-sm)] select-all">
                      {secret}
                    </code>
                  </div>
                </div>

                <p className="text-sm text-muted mb-2">Enter the 6-digit code from your app:</p>
                <div className="flex justify-center gap-2 mb-3">
                  {twoFaCode.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { twoFaRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleTwoFaInput(i, e.target.value)}
                      onKeyDown={(e) => handleTwoFaKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-[var(--radius-md)] border border-border bg-surface text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    />
                  ))}
                </div>
                {twoFaError && <p className="text-sm text-error text-center mb-2">{twoFaError}</p>}
                <div className="flex gap-2 justify-center">
                  <Button variant="ghost" size="sm" onClick={() => { setTwoFaStep("idle"); setTwoFaCode(["","","","","",""]); setTwoFaError(""); }}>
                    Cancel
                  </Button>
                  <Button size="sm" loading={twoFaLoading} onClick={confirmSetup2FA} disabled={twoFaCode.some((d) => !d)}>
                    Verify &amp; Enable
                  </Button>
                </div>
              </div>
            )}

            {/* Backup codes */}
            {twoFaStep === "backup" && (
              <div className="mt-4 border-t border-border pt-4">
                <div className="bg-accent/5 border border-accent/20 rounded-[var(--radius-md)] p-4 mb-4">
                  <p className="text-sm font-semibold text-accent mb-2">Save your backup codes</p>
                  <p className="text-xs text-muted mb-3">
                    Store these codes somewhere safe. Each code can only be used once if you lose access to your authenticator app.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code) => (
                      <code key={code} className="text-sm font-mono text-foreground bg-surface px-3 py-1.5 rounded-[var(--radius-sm)] text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => { setTwoFaStep("idle"); setTwoFaCode(["","","","","",""]); }}>
                  Done
                </Button>
              </div>
            )}

            {/* Disable step */}
            {twoFaStep === "disable" && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted mb-2">Enter a code from your authenticator app to disable 2FA:</p>
                <div className="flex justify-center gap-2 mb-3">
                  {twoFaCode.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { twoFaRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleTwoFaInput(i, e.target.value)}
                      onKeyDown={(e) => handleTwoFaKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-[var(--radius-md)] border border-border bg-surface text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    />
                  ))}
                </div>
                {twoFaError && <p className="text-sm text-error text-center mb-2">{twoFaError}</p>}
                <div className="flex gap-2 justify-center">
                  <Button variant="ghost" size="sm" onClick={() => { setTwoFaStep("idle"); setTwoFaCode(["","","","","",""]); setTwoFaError(""); }}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" loading={twoFaLoading} onClick={disable2FA} disabled={twoFaCode.some((d) => !d)}>
                    Disable 2FA
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <GoldDivider />

        <h2 className="font-display text-xl font-semibold mb-6 mt-6">Booking History</h2>
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

                <div className="flex flex-wrap gap-2">
                  {!booking.cancelled && booking.trip_status !== "complete" && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/pay?booking=${booking.id}`)}
                    >
                      Pay
                    </Button>
                  )}
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
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(booking)}
                    >
                      Edit Booking
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

      {/* Edit Booking Modal */}
      <Modal
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
        title="Edit Booking"
      >
        <div className="space-y-4">
          <Input
            label="Pickup Location"
            value={editForm.pickup_location}
            onChange={(e) => setEditForm((f) => ({ ...f, pickup_location: e.target.value }))}
            required
          />
          <Input
            label="Drop-off Location"
            value={editForm.drop_off_location}
            onChange={(e) => setEditForm((f) => ({ ...f, drop_off_location: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Passengers"
              type="number"
              min="1"
              value={editForm.no_of_passengers}
              onChange={(e) => setEditForm((f) => ({ ...f, no_of_passengers: e.target.value }))}
            />
            <Input
              label="Luggage Items"
              type="number"
              min="0"
              value={editForm.no_of_luggage_items}
              onChange={(e) => setEditForm((f) => ({ ...f, no_of_luggage_items: e.target.value }))}
            />
          </div>
          <Input
            label="Flight Number"
            value={editForm.flight_number}
            onChange={(e) => setEditForm((f) => ({ ...f, flight_number: e.target.value }))}
          />
          <Input
            label="Flight Arrival"
            type="datetime-local"
            value={editForm.flight_arrival}
            onChange={(e) => setEditForm((f) => ({ ...f, flight_arrival: e.target.value }))}
          />
          <Textarea
            label="Notes"
            value={editForm.notes}
            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditBooking(null)}>
              Cancel
            </Button>
            <Button loading={editLoading} onClick={submitEdit}>
              Save Changes
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
