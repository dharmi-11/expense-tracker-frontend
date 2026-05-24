"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { currency } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

const currentMonth = new Date().toISOString().slice(0, 7);

export default function AnalyticsPage() {
  const { user } = useAuth();
  const breakdownQuery = useQuery({
    queryKey: ["category-breakdown", currentMonth],
    queryFn: () => endpoints.categoryBreakdown(currentMonth),
  });
  const trendsQuery = useQuery({
    queryKey: ["monthly-trends"],
    queryFn: () => endpoints.monthlyTrends(6),
  });

  const currencyCode = user?.currency ?? "USD";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Category split</p>
        <h2 className="section-title text-2xl font-semibold">Expenses by category</h2>

        <div className="mt-6 h-[340px]">
          {breakdownQuery.isLoading ? (
            <LoadingSkeleton className="h-full w-full rounded-[28px]" />
          ) : breakdownQuery.data?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownQuery.data} dataKey="amount" nameKey="category" innerRadius={78} outerRadius={118} paddingAngle={4}>
                  {breakdownQuery.data.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(Number(value ?? 0), currencyCode)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No category data yet"
              description="Add expense transactions to populate the category breakdown chart."
            />
          )}
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Trend comparison</p>
        <h2 className="section-title text-2xl font-semibold">Income vs expenses</h2>

        <div className="mt-6 h-[340px]">
          {trendsQuery.isLoading ? (
            <LoadingSkeleton className="h-full w-full rounded-[28px]" />
          ) : trendsQuery.data?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsQuery.data}>
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip formatter={(value) => currency(Number(value ?? 0), currencyCode)} />
                <Bar dataKey="income" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No trend data yet"
              description="Log transactions across months to visualize your financial momentum."
            />
          )}
        </div>
      </section>
    </div>
  );
}
