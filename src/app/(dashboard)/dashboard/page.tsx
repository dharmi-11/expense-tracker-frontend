"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarRange,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { currency, formatMonthLabel, getRecentMonthOptions, percentage } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const overviewQuery = useQuery({
    queryKey: ["overview", selectedMonth],
    queryFn: () => endpoints.overview(selectedMonth),
  });
  const budgetQuery = useQuery({
    queryKey: ["budgets", selectedMonth],
    queryFn: () => endpoints.budgets(selectedMonth),
  });
  const breakdownQuery = useQuery({
    queryKey: ["category-breakdown", selectedMonth],
    queryFn: () => endpoints.categoryBreakdown(selectedMonth),
  });

  const overview = overviewQuery.data;
  const budgets = useMemo(() => budgetQuery.data ?? [], [budgetQuery.data]);
  const currencyCode = user?.currency ?? "USD";

  const topBudget = useMemo(
    () => [...budgets].sort((left, right) => right.progress - left.progress)[0],
    [budgets],
  );
  const largestCategory = useMemo(
    () => [...(breakdownQuery.data ?? [])].sort((left, right) => right.amount - left.amount)[0],
    [breakdownQuery.data],
  );
  const monthOptions = getRecentMonthOptions(12);

  return (
    <div className="space-y-4">
      <section className="dashboard-panel overflow-hidden rounded-[32px] p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="chip">Financial command center</div>
            <h1 className="section-title mt-4 text-3xl font-semibold sm:text-[2.4rem]">
              A calmer view of your cash flow for {formatMonthLabel(selectedMonth)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Review performance, spot pressure points, and keep budget discipline visible without digging through transaction noise.
            </p>
          </div>

          <label className="field-shell flex min-w-[220px] items-center gap-3">
            <CalendarRange className="h-4 w-4 text-[var(--muted)]" />
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="dashboard-panel rounded-[28px] border border-[var(--border)] p-5">
            <p className="text-sm text-[var(--muted)]">Current posture</p>
            <p className="section-title mt-2 text-2xl font-semibold">
              {overview
                ? overview.remainingBalance >= 0
                  ? "Positive runway"
                  : "Needs attention"
                : "Loading overview"}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {overview
                ? `${currency(overview.remainingBalance, currencyCode)} remaining after this month's activity.`
                : "We are summarizing this month's income and spending activity."}
            </p>
          </div>

          <div className="dashboard-panel rounded-[28px] border border-[var(--border)] p-5">
            <p className="text-sm text-[var(--muted)]">Top budget pressure</p>
            <p className="section-title mt-2 text-2xl font-semibold">
              {topBudget ? topBudget.category.name : "No budgets yet"}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {topBudget
                ? `${percentage(topBudget.progress)} used with ${currency(topBudget.remaining, currencyCode)} remaining.`
                : "Create budget targets to surface category pressure here."}
            </p>
          </div>

          <div className="dashboard-panel rounded-[28px] border border-[var(--border)] p-5">
            <p className="text-sm text-[var(--muted)]">Largest expense category</p>
            <p className="section-title mt-2 text-2xl font-semibold">
              {largestCategory ? largestCategory.category : "Waiting for data"}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {largestCategory
                ? `${currency(largestCategory.amount, currencyCode)} recorded in ${largestCategory.category.toLowerCase()}.`
                : "Add expenses in this month to reveal the strongest spending category."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {overview ? (
          <>
            <StatCard
              title="Total income"
              value={currency(overview.totalIncome, currencyCode)}
              helper="All incoming cash recorded this month"
              icon={<ArrowUpCircle className="h-5 w-5" />}
              accent="#0f766e"
            />
            <StatCard
              title="Total expenses"
              value={currency(overview.totalExpenses, currencyCode)}
              helper="Outgoing transactions currently logged"
              icon={<ArrowDownCircle className="h-5 w-5" />}
              accent="#dc2626"
            />
            <StatCard
              title="Remaining balance"
              value={currency(overview.remainingBalance, currencyCode)}
              helper="Net position after income and expenses"
              icon={<Wallet2 className="h-5 w-5" />}
              accent={overview.remainingBalance >= 0 ? "#0f766e" : "#dc2626"}
            />
            <StatCard
              title="Budget usage"
              value={percentage(overview.budgetProgress)}
              helper="Progress against active monthly budgets"
              icon={<PiggyBank className="h-5 w-5" />}
              accent="#2563eb"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40 rounded-[30px]" />
          ))
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Recent transactions</p>
              <h2 className="section-title text-2xl font-semibold">Latest activity</h2>
            </div>
            {overview ? (
              <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                {overview.recentTransactions.length} latest entries
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            {overviewQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-20 w-full rounded-[24px]" />
              ))
            ) : overview?.recentTransactions.length ? (
              overview.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="dashboard-panel rounded-[24px] border border-[var(--border)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{transaction.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {transaction.category.name} - {format(new Date(transaction.transactionDate), "PPP")}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {currency(transaction.amount, currencyCode)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Wallet2 className="h-5 w-5" />}
                title="No transactions yet"
                description="Start by adding income or expenses from the transactions page."
              />
            )}
          </div>
        </div>

        <div className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Budget discipline</p>
              <h2 className="section-title text-2xl font-semibold">Monthly targets</h2>
            </div>
            {topBudget ? (
              <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                Highest usage: {topBudget.category.name}
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {budgetQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-20 w-full rounded-[24px]" />
              ))
            ) : budgets.length ? (
              budgets.map((budget) => {
                const statusIcon =
                  budget.progress >= 100 ? (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  );

                return (
                  <div key={budget.id} className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{budget.category.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {currency(budget.spent, currencyCode)} spent of {currency(budget.amount, currencyCode)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                        {statusIcon}
                        {percentage(budget.progress)}
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(budget.progress, 100)}%`,
                          backgroundColor: budget.category.color,
                        }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                      <span>{currency(budget.remaining, currencyCode)} remaining</span>
                      <span>{budget.progress >= 100 ? "Over plan" : "Within plan"}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={<PiggyBank className="h-5 w-5" />}
                title="No budgets configured"
                description="Set monthly budgets to visualize progress and spending discipline."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
