"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApi } from "@/lib/api/use-api";
import type { Feedback } from "@/lib/api/types";
import type { BadgeVariant } from "@/components/ui/status-badge";

const typeVariant: Record<string, BadgeVariant> = {
  comment: "info",
  issue: "error",
  critique: "warning",
};

export default function AdminFeedbackPage() {
  const api = useApi();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    api.getFeedback().then(setFeedback).finally(() => setLoading(false));
  }, [api]);

  if (loading) return <p className="text-muted animate-pulse">Loading feedback&hellip;</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Feedback</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted py-8">
                    No feedback received.
                  </TableCell>
                </TableRow>
              ) : (
                feedback.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <StatusBadge variant={typeVariant[f.feedback_type]}>
                        {f.feedback_type}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[400px] text-sm text-muted-light">{f.feedback}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{f.user_id}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(f.created_at).toLocaleDateString()}
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
