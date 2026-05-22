"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useApi } from "@/lib/api/use-api";
import type { Booking, TripStatus } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

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

export default function AdminBookingsPage() {
  const api = useApi();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<TripStatus>("pending");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.getBookings().then(setBookings).finally(() => setLoading(false));
  }, [api]);

  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return b.cancelled;
    return !b.cancelled && b.trip_status === filter;
  });

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

  if (loading) return <p className="text-muted animate-pulse">Loading bookings&hellip;</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <div className="w-48">
          <Select options={statusFilter} value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
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
                  <TableCell colSpan={6} className="text-center text-muted py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(b);
                          setNewStatus(b.trip_status);
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail / Status Update Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              {[
                ["Reference", selected.id],
                ["Pickup", selected.pickup_location],
                ["Drop-off", selected.drop_off_location],
                ["Passengers", String(selected.no_of_passengers)],
                ["Luggage", String(selected.no_of_luggage_items)],
                ["Transport", selected.mode_of_transport],
                ["Flight", selected.flight_number || "\u2014"],
                ["Contact", selected.contact_name || "\u2014"],
                ["Phone", selected.contact_phone || "\u2014"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
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
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button loading={updating} onClick={handleStatusUpdate}>
                    Update Status
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
