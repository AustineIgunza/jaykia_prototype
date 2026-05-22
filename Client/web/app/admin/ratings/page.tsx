"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useApi } from "@/lib/api/use-api";
import type { Rating } from "@/lib/api/types";

function Stars({ count }: { count: number }) {
  return (
    <span className="text-accent" aria-label={`${count} out of 5 stars`}>
      {"\u2605".repeat(count)}
      {"\u2606".repeat(5 - count)}
    </span>
  );
}

export default function AdminRatingsPage() {
  const api = useApi();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    api.getRatings().then(setRatings).finally(() => setLoading(false));
  }, [api]);

  if (loading) return <p className="text-muted animate-pulse">Loading ratings&hellip;</p>;

  const avg = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Ratings</h1>
        <div className="text-right">
          <p className="text-xs text-muted uppercase">Average Rating</p>
          <p className="font-display text-xl font-bold text-accent">{avg} / 5</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted py-8">
                    No ratings yet.
                  </TableCell>
                </TableRow>
              ) : (
                ratings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.booking_id}</TableCell>
                    <TableCell><Stars count={r.rating} /></TableCell>
                    <TableCell>
                      <p className="max-w-[300px] truncate text-sm text-muted-light">
                        {r.comments || "\u2014"}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
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
