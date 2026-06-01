"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, CalendarRange, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { currency, formatMonthLabel, getRecentMonthOptions } from "@/lib/utils";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [trendWindow, setTrendWindow] = useState(6);
  const breakdownQuery = useQuery({
    queryKey: ["category-breakdown", selectedMonth],
    queryFn: () => endpoints.categoryBreakdown(selectedMonth),
  });
  const trendsQuery = useQuery({
    queryKey: ["monthly-trends", trendWindow],
    queryFn: () => endpoints.monthlyTrends(trendWindow),
  });

  const currencyCode = user?.currency ?? "USD";
  const totalCategorySpend = useMemo(
    () => (breakdownQuery.data ?? []).reduce((sum, item) => sum + Number(item.amount), 0),
    [breakdownQuery.data],
  );
  const trendSummary = useMemo(() => {
    const entries = trendsQuery.data ?? [];
    return {
      income: entries.reduce((sum, item) => sum + Number(item.income), 0),
      expenses: entries.reduce((sum, item) => sum + Number(item.expenses), 0),
    };
  }, [trendsQuery.data]);
  const monthOptions = getRecentMonthOptions(12);

  return (
    <div className="space-y-4">
      <section className="dashboard-panel rounded-[32px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="chip">Analytics and trends</div>
            <h1 className="section-title mt-4 text-3xl font-semibold sm:text-[2.3rem]">
              See where money is moving and where it is pooling
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Compare income versus expenses, review category concentration, and turn monthly activity into clearer decisions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="field-shell flex min-w-[220px] items-center gap-3">
              <CalendarRange className="h-4 w-4 text-[var(--muted)]" />
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full bg-transparent outline-none"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-shell flex min-w-[180px] items-center gap-3">
              <Layers3 className="h-4 w-4 text-[var(--muted)]" />
              <select
                value={trendWindow}
                onChange={(event) => setTrendWindow(Number(event.target.value))}
                className="w-full bg-transparent outline-none"
              >
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">Category split</p>
              <h2 className="section-title text-2xl font-semibold">
                Expenses by category for {formatMonthLabel(selectedMonth)}
              </h2>
            </div>
            <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {currency(totalCategorySpend, currencyCode)} tracked
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <div className="h-[320px]">
              {breakdownQuery.isLoading ? (
                <LoadingSkeleton className="h-full w-full rounded-[28px]" />
              ) : breakdownQuery.data?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownQuery.data}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={78}
                      outerRadius={118}
                      paddingAngle={4}
                    >
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
                  description="Add expense transactions in this month to populate the category breakdown chart."
                />
              )}
            </div>

            <div className="space-y-3">
              {(breakdownQuery.data ?? []).length ? (
                breakdownQuery.data?.map((item) => (
                  <div key={item.categoryId} className="dashboard-panel rounded-[22px] border border-[var(--border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <span className="text-sm text-[var(--muted)]">
                        {totalCategorySpend
                          ? `${Math.round((item.amount / totalCategorySpend) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{currency(item.amount, currencyCode)}</p>
                  </div>
                ))
              ) : (
                <div className="dashboard-panel rounded-[22px] border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  Category distribution will appear once expense entries exist in the selected month.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">Trend comparison</p>
              <h2 className="section-title text-2xl font-semibold">Income vs expenses</h2>
            </div>
            <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {trendWindow} month view
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="dashboard-panel rounded-[22px] border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)]">Tracked income</p>
              <p className="section-title mt-2 text-2xl font-semibold text-emerald-600">
                {currency(trendSummary.income, currencyCode)}
              </p>
            </div>
            <div className="dashboard-panel rounded-[22px] border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)]">Tracked expenses</p>
              <p className="section-title mt-2 text-2xl font-semibold text-rose-500">
                {currency(trendSummary.expenses, currencyCode)}
              </p>
            </div>
          </div>

          <div className="mt-6 h-[340px]">
            {trendsQuery.isLoading ? (
              <LoadingSkeleton className="h-full w-full rounded-[28px]" />
            ) : trendsQuery.data?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsQuery.data} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
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
    </div>
  );
}
