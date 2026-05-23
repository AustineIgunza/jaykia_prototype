"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { GoldDivider } from "@/components/ui/gold-divider";
import { SkeletonTable } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import type { Booking, TripStatus } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+254700000000";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  ongoing: "info",
  complete: "success",
};

const statusFilter = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "Ongoing" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

function buildClientWhatsAppUrl(booking: Booking) {
  const phone = booking.contact_phone?.replace(/\s/g, "") || "";
  const msg = [
    `Hi ${booking.contact_name || "there"}, this is JayKia Executive Transfers.`,
    ``,
    `Regarding your booking (Ref: ${booking.id}):`,
    `Pickup: ${booking.pickup_location}`,
    `Drop-off: ${booking.drop_off_location}`,
    booking.flight_number ? `Flight: ${booking.flight_number}` : "",
    ``,
    `We'd like to discuss your transfer details and quote.`,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function AdminBookingsPage() {
  const api = useApi();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<TripStatus>("pending");
  const [updating, setUpdating] = useState(false);

  // Cancel modal
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  // Assign driver modal
  const [assignBooking, setAssignBooking] = useState<Booking | null>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, [api]);

  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return b.cancelled;
    return !b.cancelled && b.trip_status === filter;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => !b.cancelled && b.trip_status === "pending").length,
    ongoing: bookings.filter((b) => !b.cancelled && b.trip_status === "ongoing").length,
    complete: bookings.filter((b) => !b.cancelled && b.trip_status === "complete").length,
    cancelled: bookings.filter((b) => b.cancelled).length,
  };

  async function handleStatusUpdate() {
    if (!api || !selected) return;
    setUpdating(true);
    try {
      const updated = await api.updateBooking(selected.id, { trip_status: newStatus });
      setBookings((prev) => prev.map((b) => (b.id === selected.id ? updated : b)));
      setSelected(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!api || !cancelBooking) return;
    setCancelLoading(true);
    try {
      const updated = await api.updateBooking(cancelBooking.id, {
        cancelled: true,
        cancelled_at: new Date().toISOString(),
        reason: cancelReason,
      });
      setBookings((prev) => prev.map((b) => (b.id === cancelBooking.id ? updated : b)));
      setCancelBooking(null);
      setCancelReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleAssignDriver() {
    if (!api || !assignBooking) return;
    setAssignLoading(true);
    try {
      // Store driver assignment in notes for now — backend will have a proper driver assignment table
      const driverInfo = `Driver: ${driverName} (${driverPhone})`;
      const existingNotes = assignBooking.notes || "";
      const notes = existingNotes ? `${existingNotes}\n${driverInfo}` : driverInfo;
      const updated = await api.updateBooking(assignBooking.id, {
        notes,
        trip_status: "ongoing",
      });
      setBookings((prev) => prev.map((b) => (b.id === assignBooking.id ? updated : b)));
      setAssignBooking(null);
      setDriverName("");
      setDriverPhone("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  }

  if (loading) return <SkeletonTable rows={6} />;

  return (
    <FadeIn>
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <div className="w-48">
          <Select options={statusFilter} value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {([
          { key: "all", label: "Total", variant: "info" as BadgeVariant },
          { key: "pending", label: "Pending", variant: "pending" as BadgeVariant },
          { key: "ongoing", label: "Ongoing", variant: "info" as BadgeVariant },
          { key: "complete", label: "Complete", variant: "success" as BadgeVariant },
          { key: "cancelled", label: "Cancelled", variant: "error" as BadgeVariant },
        ] as const).map(({ key, label, variant }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-left p-3 rounded-[var(--radius-md)] border transition-all cursor-pointer ${
              filter === key
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:bg-surface-hover"
            }`}
          >
            <p className="text-xs text-muted">{label}</p>
            <p className="font-display text-xl font-bold">{counts[key]}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium">{b.contact_name || "\u2014"}</p>
                        <p className="text-xs text-muted">{b.contact_phone || ""}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[180px]">
                        <p className="truncate text-xs">{b.pickup_location}</p>
                        <p className="truncate text-xs text-muted">&rarr; {b.drop_off_location}</p>
                      </div>
                    </TableCell>
                    <TableCell>{b.no_of_passengers}</TableCell>
                    <TableCell className="text-xs">{b.flight_number || "\u2014"}</TableCell>
                    <TableCell>
                      <StatusBadge variant={b.cancelled ? "error" : statusVariant[b.trip_status]}>
                        {b.cancelled ? "Cancelled" : b.trip_status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(b);
                            setNewStatus(b.trip_status);
                          }}
                        >
                          View
                        </Button>
                        {!b.cancelled && b.contact_phone && (
                          <a
                            href={buildClientWhatsAppUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs text-[#25D366] hover:bg-[#25D366]/10 rounded-[var(--radius-md)] transition-colors"
                            title="WhatsApp client"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (
          <div className="space-y-4">
            {/* Client info */}
            <div className="p-3 bg-surface rounded-[var(--radius-md)] border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Client</p>
              <p className="font-semibold">{selected.contact_name || "Unknown"}</p>
              <p className="text-sm text-muted">{selected.contact_email || "\u2014"}</p>
              <p className="text-sm text-muted">{selected.contact_phone || "\u2014"}</p>
            </div>

            <dl className="space-y-2 text-sm">
              {[
                ["Reference", selected.id],
                ["Pickup", selected.pickup_location],
                ["Drop-off", selected.drop_off_location],
                ["Passengers", String(selected.no_of_passengers)],
                ["Luggage", String(selected.no_of_luggage_items)],
                ["Transport", selected.mode_of_transport],
                ["Flight", selected.flight_number || "\u2014"],
                ["Arrival", selected.flight_arrival ? new Date(selected.flight_arrival).toLocaleString() : "\u2014"],
                ["Child Seat", selected.child_seat ? "Yes" : "No"],
                ["Booked", selected.created_at ? new Date(selected.created_at).toLocaleString() : "\u2014"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            {selected.notes && (
              <div className="p-3 bg-surface rounded-[var(--radius-md)] border border-border">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{selected.notes}</p>
              </div>
            )}

            {selected.cancelled && (
              <div className="p-3 bg-red-500/10 rounded-[var(--radius-md)] border border-red-500/20">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Cancelled</p>
                <p className="text-sm">{selected.reason || "No reason provided"}</p>
                {selected.cancelled_at && (
                  <p className="text-xs text-muted mt-1">
                    {new Date(selected.cancelled_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <GoldDivider />

            {!selected.cancelled && (
              <>
                <Select
                  label="Update Status"
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "ongoing", label: "Ongoing" },
                    { value: "complete", label: "Complete" },
                  ]}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TripStatus)}
                />

                <div className="flex flex-wrap gap-2">
                  <Button loading={updating} onClick={handleStatusUpdate}>
                    Update Status
                  </Button>
                  {selected.trip_status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAssignBooking(selected);
                        setSelected(null);
                      }}
                    >
                      Assign Driver
                    </Button>
                  )}
                  {selected.contact_phone && (
                    <a
                      href={buildClientWhatsAppUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-[var(--radius-md)] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Client
                    </a>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => {
                      setCancelBooking(selected);
                      setSelected(null);
                    }}
                  >
                    Cancel Booking
                  </Button>
                </div>
              </>
            )}

            {selected.cancelled && (
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal
        open={!!cancelBooking}
        onClose={() => setCancelBooking(null)}
        title="Cancel Booking"
      >
        {cancelBooking && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Cancel booking <span className="font-mono text-accent">{cancelBooking.id}</span> for{" "}
              <strong className="text-foreground">{cancelBooking.contact_name}</strong>?
            </p>
            <Textarea
              label="Cancellation Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              required
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setCancelBooking(null)}>
                Back
              </Button>
              <Button
                variant="danger"
                loading={cancelLoading}
                disabled={!cancelReason.trim()}
                onClick={handleCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Driver Modal */}
      <Modal
        open={!!assignBooking}
        onClose={() => setAssignBooking(null)}
        title="Assign Driver"
      >
        {assignBooking && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Assign a driver to booking <span className="font-mono text-accent">{assignBooking.id}</span>
            </p>
            <div className="p-3 bg-surface rounded-[var(--radius-md)] border border-border text-sm">
              <p>{assignBooking.pickup_location} &rarr; {assignBooking.drop_off_location}</p>
              <p className="text-muted">{assignBooking.no_of_passengers} passenger(s) &middot; {assignBooking.flight_number || "No flight"}</p>
            </div>
            <Input
              label="Driver Name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. John Kamau"
              required
            />
            <Input
              label="Driver Phone"
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              required
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setAssignBooking(null)}>
                Cancel
              </Button>
              <Button
                loading={assignLoading}
                disabled={!driverName.trim() || !driverPhone.trim()}
                onClick={handleAssignDriver}
              >
                Assign &amp; Start Trip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </FadeIn>
  );
}
