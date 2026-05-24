"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { StatCard } from "@/components/stat-card";
import { endpoints } from "@/lib/api";
import { currency } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

const currentMonth = new Date().toISOString().slice(0, 7);

export default function DashboardPage() {
  const { user } = useAuth();
  const overviewQuery = useQuery({
    queryKey: ["overview", currentMonth],
    queryFn: () => endpoints.overview(currentMonth),
  });
  const budgetQuery = useQuery({
    queryKey: ["budgets", currentMonth],
    queryFn: () => endpoints.budgets(currentMonth),
  });

  const overview = overviewQuery.data;
  const budgets = budgetQuery.data ?? [];
  const currencyCode = user?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-4">
        {overview ? (
          <>
            <StatCard
              title="Total income"
              value={currency(overview.totalIncome, currencyCode)}
              helper="All income logged this month"
              icon={<ArrowUpCircle className="h-5 w-5" />}
            />
            <StatCard
              title="Total expenses"
              value={currency(overview.totalExpenses, currencyCode)}
              helper="Every outgoing transaction this month"
              icon={<ArrowDownCircle className="h-5 w-5" />}
            />
            <StatCard
              title="Remaining balance"
              value={currency(overview.remainingBalance, currencyCode)}
              helper="Income minus expenses"
              icon={<Wallet2 className="h-5 w-5" />}
            />
            <StatCard
              title="Budget usage"
              value={`${Math.round(overview.budgetProgress)}%`}
              helper="Tracked against your current monthly budgets"
              icon={<PiggyBank className="h-5 w-5" />}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40 rounded-[30px]" />
          ))
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Recent transactions</p>
              <h2 className="section-title text-2xl font-semibold">Latest activity</h2>
            </div>
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
                  className="rounded-[24px] border border-[var(--border)] bg-white/55 px-4 py-4 dark:bg-slate-950/25"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{transaction.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {transaction.category.name} • {format(new Date(transaction.transactionDate), "PPP")}
                      </p>
                    </div>
                    <p className={`font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
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

        <div className="surface-card rounded-[30px] p-6">
          <p className="text-sm text-[var(--muted)]">Budget progress</p>
          <h2 className="section-title text-2xl font-semibold">Monthly targets</h2>

          <div className="mt-6 space-y-4">
            {budgetQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-20 w-full rounded-[24px]" />
              ))
            ) : budgets.length ? (
              budgets.map((budget) => (
                <div key={budget.id} className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4 dark:bg-slate-950/25">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{budget.category.name}</span>
                    <span className="text-[var(--muted)]">{Math.round(budget.progress)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(budget.progress, 100)}%`,
                        backgroundColor: budget.category.color,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>{currency(budget.spent, currencyCode)} spent</span>
                    <span>{currency(budget.amount, currencyCode)} limit</span>
                  </div>
                </div>
              ))
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
