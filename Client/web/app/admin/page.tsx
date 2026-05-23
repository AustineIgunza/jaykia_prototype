"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/gold-divider";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CountUp, Stagger, StaggerItem, FadeIn } from "@/components/motion";
import { SkeletonPage } from "@/components/ui/skeleton";
import { useApi } from "@/lib/api/use-api";
import type { DashboardSummary, MonthlyReport } from "@/lib/api/types";

export default function AdminOverviewPage() {
  const api = useApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    Promise.all([api.getDashboardSummary(), api.getMonthlyReports()])
      .then(([s, r]) => {
        setSummary(s);
        setReports(r);
      })
      .finally(() => setLoading(false));
  }, [api]);

  if (loading || !summary) {
    return <SkeletonPage />;
  }

  const kpis = [
    { label: "Trips Completed", value: summary.tripsCompleted, accent: false },
    { label: "Clients Served", value: summary.clientsServed, accent: false },
    { label: "Revenue (KES)", value: summary.revenue, accent: true, prefix: "KES " },
    { label: "Repeat Clients", value: summary.repeatClients, accent: false },
  ];

  return (
    <div>
      <FadeIn>
        <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>
      </FadeIn>

      {/* KPI Cards */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" staggerDelay={0.1}>
        {kpis.map((kpi) => (
          <StaggerItem key={kpi.label}>
            <Card>
              <CardContent>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className={`font-display text-2xl font-bold ${kpi.accent ? "text-accent" : "text-foreground"}`}>
                  <CountUp
                    value={kpi.value}
                    prefix={kpi.prefix}
                    duration={1.8}
                  />
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <GoldDivider />

      {/* Monthly Report */}
      <FadeIn>
        <h2 className="font-display text-xl font-semibold mb-4">Monthly Report</h2>
      </FadeIn>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Trips Completed</TableHead>
                <TableHead>Clients Served</TableHead>
                <TableHead>Revenue (KES)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell>{r.tripsCompleted.toLocaleString()}</TableCell>
                  <TableCell>{r.clientsServed.toLocaleString()}</TableCell>
                  <TableCell className="text-accent font-semibold">
                    {r.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
