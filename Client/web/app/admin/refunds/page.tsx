"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api/use-api";
import type { Refund } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const approvalVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  accepted: "success",
  rejected: "error",
};

export default function AdminRefundsPage() {
  const api = useApi();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    api.getRefunds().then(setRefunds).finally(() => setLoading(false));
  }, [api]);

  async function handleAction(refundId: string, approved: "accepted" | "rejected") {
    if (!api) return;
    setActionLoading(refundId);
    try {
      const updated = await api.updateRefund(refundId, { approved });
      setRefunds((prev) => prev.map((r) => (r.id === refundId ? updated : r)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <p className="text-muted animate-pulse">Loading refunds&hellip;</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Refund Requests</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted py-8">
                    No refund requests.
                  </TableCell>
                </TableRow>
              ) : (
                refunds.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.booking_id}</TableCell>
                    <TableCell>
                      <p className="max-w-[250px] truncate text-sm">{r.reason}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={approvalVariant[r.approved]}>
                        {r.approved}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {r.approved === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={actionLoading === r.id}
                            onClick={() => handleAction(r.id, "accepted")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={actionLoading === r.id}
                            onClick={() => handleAction(r.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Resolved</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
