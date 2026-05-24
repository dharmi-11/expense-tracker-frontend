"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { currency } from "@/lib/utils";

const schema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().min(0),
  month: z.string().min(7),
});

type BudgetFormValues = z.input<typeof schema>;
type BudgetFormPayload = z.output<typeof schema>;
const currentMonth = new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<BudgetFormValues, undefined, BudgetFormPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      amount: 0,
      month: currentMonth,
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => endpoints.categories("EXPENSE"),
  });
  const budgetsQuery = useQuery({
    queryKey: ["budgets", currentMonth],
    queryFn: () => endpoints.budgets(currentMonth),
  });

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormPayload) => endpoints.createBudget(values),
    onSuccess: () => {
      toast.success("Budget saved.");
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      form.reset({ categoryId: "", amount: 0, month: currentMonth });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteBudget(id),
    onSuccess: () => {
      toast.success("Budget removed.");
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));
  const currencyCode = user?.currency ?? "USD";

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Plan ahead</p>
        <h2 className="section-title text-2xl font-semibold">Create a budget</h2>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <select {...form.register("categoryId")} className="field-shell w-full">
            <option value="">Select category</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input {...form.register("amount")} type="number" step="0.01" placeholder="Budget amount" className="field-shell w-full" />
          <input {...form.register("month")} type="month" className="field-shell w-full" />
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Save budget
          </button>
        </form>
      </section>

      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Monthly view</p>
        <h2 className="section-title text-2xl font-semibold">Budget progress</h2>

        <div className="mt-6 space-y-4">
          {budgetsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-24 w-full rounded-[24px]" />
            ))
          ) : budgetsQuery.data?.length ? (
            budgetsQuery.data.map((budget) => (
              <div key={budget.id} className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4 dark:bg-slate-950/25">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{budget.category.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {currency(budget.spent, currencyCode)} spent of {currency(budget.amount, currencyCode)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(budget.id)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full"
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
  );
}
