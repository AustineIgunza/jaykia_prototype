"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApi } from "@/lib/api/use-api";
import type { Payment } from "@/lib/api/types";

export default function AdminPaymentsPage() {
  const api = useApi();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    api.getPayments().then(setPayments).finally(() => setLoading(false));
  }, [api]);

  if (loading) return <p className="text-muted animate-pulse">Loading payments&hellip;</p>;

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Payments</h1>
        <div className="text-right">
          <p className="text-xs text-muted uppercase">Total Collected</p>
          <p className="font-display text-xl font-bold text-accent">KES {total.toLocaleString()}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted py-8">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-mono text-xs">{p.booking_id || "\u2014"}</TableCell>
                    <TableCell className="font-semibold text-accent">
                      {p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant="info">{p.payment_method}</StatusBadge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.transaction_reference || "\u2014"}</TableCell>
                    <TableCell className="text-xs">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : "\u2014"}
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
