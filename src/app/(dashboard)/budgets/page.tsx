"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { currency, formatMonthLabel, getRecentMonthOptions } from "@/lib/utils";

const schema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  amount: z.coerce.number().min(0.01, "Budget amount must be greater than 0"),
  month: z.string().min(7, "Choose a budget month"),
});

type BudgetFormValues = z.input<typeof schema>;
type BudgetFormPayload = z.output<typeof schema>;

export default function BudgetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const form = useForm<BudgetFormValues, undefined, BudgetFormPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      amount: 0,
      month: selectedMonth,
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => endpoints.categories("EXPENSE"),
  });
  const budgetsQuery = useQuery({
    queryKey: ["budgets", selectedMonth],
    queryFn: () => endpoints.budgets(selectedMonth),
  });

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormPayload) => endpoints.createBudget(values),
    onSuccess: () => {
      toast.success("Budget saved.");
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      form.reset({ categoryId: "", amount: 0, month: selectedMonth });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save budget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteBudget(id),
    onSuccess: () => {
      toast.success("Budget removed.");
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete budget");
    },
  });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));
  const currencyCode = user?.currency ?? "USD";
  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data]);
  const summary = useMemo(
    () => ({
      totalAllocated: budgets.reduce((sum, budget) => sum + Number(budget.amount), 0),
      totalSpent: budgets.reduce((sum, budget) => sum + Number(budget.spent), 0),
      totalRemaining: budgets.reduce((sum, budget) => sum + Number(budget.remaining), 0),
    }),
    [budgets],
  );
  const monthOptions = getRecentMonthOptions(12);

  return (
    <div className="space-y-4">
      <section className="dashboard-panel rounded-[32px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="chip">Budget planning</div>
            <h1 className="section-title mt-4 text-3xl font-semibold sm:text-[2.3rem]">
              Set spending limits that are easy to review and adjust
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Create category targets, monitor pressure points, and keep monthly planning visible in a cleaner budget view.
            </p>
          </div>

          <label className="field-shell flex min-w-[220px] items-center gap-3">
            <CalendarRange className="h-4 w-4 text-[var(--muted)]" />
            <select
              value={selectedMonth}
              onChange={(event) => {
                const nextMonth = event.target.value;
                setSelectedMonth(nextMonth);
                form.setValue("month", nextMonth);
              }}
              className="w-full bg-transparent outline-none"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">Allocated</p>
            <p className="section-title mt-2 text-2xl font-semibold">
              {currency(summary.totalAllocated, currencyCode)}
            </p>
          </div>
          <div className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">Spent</p>
            <p className="section-title mt-2 text-2xl font-semibold text-rose-500">
              {currency(summary.totalSpent, currencyCode)}
            </p>
          </div>
          <div className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">Remaining</p>
            <p className="section-title mt-2 text-2xl font-semibold text-emerald-600">
              {currency(summary.totalRemaining, currencyCode)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="dashboard-panel rounded-[30px] p-6">
          <p className="text-sm text-[var(--muted)]">Plan ahead</p>
          <h2 className="section-title text-2xl font-semibold">Create a budget</h2>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Expense category</label>
              <select {...form.register("categoryId")} className="field-shell w-full">
                <option value="">Select category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.categoryId.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Budget amount</label>
              <input
                {...form.register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="field-shell w-full"
              />
              {form.formState.errors.amount ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.amount.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Budget month</label>
              <input {...form.register("month")} type="month" className="field-shell w-full" />
              {form.formState.errors.month ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.month.message}</p>
              ) : null}
            </div>

            <button type="submit" disabled={createMutation.isPending} className="btn-primary h-12 w-full">
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Saving budget..." : "Save budget"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">Monthly view</p>
              <h2 className="section-title text-2xl font-semibold">
                Budget progress for {formatMonthLabel(selectedMonth)}
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {budgetsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-24 w-full rounded-[24px]" />
              ))
            ) : budgets.length ? (
              budgets.map((budget) => (
                <div key={budget.id} className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{budget.category.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            budget.progress >= 100
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {budget.progress >= 100 ? "At risk" : "Healthy"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {currency(budget.spent, currencyCode)} spent of {currency(budget.amount, currencyCode)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(budget.id)}
                      className="btn-secondary border-rose-200 bg-rose-50/80 px-3 py-2 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                    <span>{Math.round(budget.progress)}% used</span>
                    <span>{currency(budget.remaining, currencyCode)} remaining</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<PiggyBank className="h-5 w-5" />}
                title="No budgets yet"
                description="Create a category budget to start tracking spending limits."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
