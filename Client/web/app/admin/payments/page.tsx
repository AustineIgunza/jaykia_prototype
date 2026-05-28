"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { FadeIn } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import { useAuth } from "@/lib/auth/context";
import type { Payment } from "@/lib/api/types";

interface PaymentMethodInfo {
  id: string;
  name: string;
  details: string;
  enabled: boolean;
}

const DEFAULT_METHODS: PaymentMethodInfo[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    details: "Pay Bill / Till Number: TBD\nAccount Name: JayKia Executive Transfers",
    enabled: true,
  },
  {
    id: "paystack",
    name: "Paystack (Card/Bank)",
    details: "Pay securely via Paystack.\nAccepts Visa, Mastercard, and bank transfers.",
    enabled: true,
  },
  {
    id: "cash",
    name: "Cash",
    details: "Cash payment accepted on delivery of service.",
    enabled: true,
  },
];

const STORAGE_KEY = "jaykia_payment_methods";

function loadMethods(): PaymentMethodInfo[] {
  if (typeof window === "undefined") return DEFAULT_METHODS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_METHODS;
  } catch {
    return DEFAULT_METHODS;
  }
}

function saveMethods(methods: PaymentMethodInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

export default function AdminPaymentsPage() {
  const api = useApi();
  const { roleTier } = useAuth();
  const canDelete = roleTier === "admin";
  const canConfig = roleTier === "admin";
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment methods management (lazily initialized from localStorage; this
  // component only renders client-side, after the admin auth guard resolves)
  const [methods, setMethods] = useState<PaymentMethodInfo[]>(loadMethods);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodInfo | null>(null);
  const [editDetails, setEditDetails] = useState("");

  useEffect(() => {
    if (!api) return;
    api.getAllPayments().then(setPayments).finally(() => setLoading(false));
  }, [api]);

  function toggleMethod(id: string) {
    const updated = methods.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    setMethods(updated);
    saveMethods(updated);
  }

  function saveMethodDetails() {
    if (!editingMethod) return;
    const updated = methods.map((m) =>
      m.id === editingMethod.id ? { ...m, details: editDetails } : m
    );
    setMethods(updated);
    saveMethods(updated);
    setEditingMethod(null);
  }

  async function handleDelete(paymentId: string) {
    if (!api) return;
    await api.deletePayment(paymentId);
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }

  const statusVariant = (s: string) => {
    switch (s) {
      case "paid": return "success" as const;
      case "pending": return "pending" as const;
      case "failed": return "error" as const;
      case "cancelled": return "warning" as const;
      default: return "info" as const;
    }
  };

  const total = payments.filter((p) => p.payment_status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <FadeIn>
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Payments</h1>

      {/* Payment Methods Section */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Accepted Payment Methods</h2>
        <p className="text-sm text-muted mb-4">
          Configure the payment methods shared with clients. Clients discuss quotes via WhatsApp and pay using these methods.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {methods.map((method) => (
            <Card key={method.id}>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{method.name}</h3>
                  {canConfig && (
                    <button
                      onClick={() => toggleMethod(method.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        method.enabled ? "bg-accent" : "bg-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          method.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                  {!canConfig && (
                    <StatusBadge variant={method.enabled ? "success" : "error"}>
                      {method.enabled ? "Active" : "Disabled"}
                    </StatusBadge>
                  )}
                </div>
                <pre className="text-xs text-muted whitespace-pre-wrap mb-3">{method.details}</pre>
                {canConfig && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMethod(method);
                      setEditDetails(method.details);
                    }}
                  >
                    Edit Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Payment History</h2>
        <div className="text-right">
          <p className="text-xs text-muted uppercase">Total Collected</p>
          <p className="font-display text-xl font-bold text-accent">KES {total.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted py-8">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-mono text-xs">{p.booking_id}</TableCell>
                    <TableCell className="font-semibold text-accent">
                      {p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant="info">{p.payment_method}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={statusVariant(p.payment_status)}>{p.payment_status}</StatusBadge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.transaction_reference || "\u2014"}</TableCell>
                    <TableCell className="text-xs">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                    </TableCell>
                    {canDelete && (
                      <TableCell>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Edit Payment Method Modal */}
      <Modal
        open={!!editingMethod}
        onClose={() => setEditingMethod(null)}
        title={`Edit ${editingMethod?.name ?? ""} Details`}
      >
        <div className="space-y-4">
          <Textarea
            label="Payment Details"
            value={editDetails}
            onChange={(e) => setEditDetails(e.target.value)}
            rows={6}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditingMethod(null)}>
              Cancel
            </Button>
            <Button onClick={saveMethodDetails}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
    </FadeIn>
  );
}
