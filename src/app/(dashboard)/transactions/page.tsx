"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Download,
  FileSearch,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { apiDownload, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Transaction } from "@/lib/types";
import { currency, formatMonthLabel, getRecentMonthOptions } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Select a category"),
  transactionDate: z.string().min(1, "Pick a date"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.input<typeof schema>;
type TransactionFormPayload = z.output<typeof schema>;

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const form = useForm<TransactionFormValues, undefined, TransactionFormPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "EXPENSE",
      categoryId: "",
      transactionDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const watchedType = form.watch("type");
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => endpoints.categories(),
  });

  const transactionQueryString = useMemo(() => {
    const params = new URLSearchParams();
    const { startDate, endDate } = getMonthRange(selectedMonth);
    params.set("page", String(page));
    params.set("limit", "8");
    if (deferredSearch) params.set("search", deferredSearch);
    if (typeFilter !== "ALL") params.set("type", typeFilter);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    return `?${params.toString()}`;
  }, [deferredSearch, page, selectedCategory, selectedMonth, typeFilter]);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", transactionQueryString],
    queryFn: () => endpoints.transactions(transactionQueryString),
  });

  const filteredCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.type === watchedType),
    [categoriesQuery.data, watchedType],
  );

  useEffect(() => {
    const currentCategory = form.getValues("categoryId");
    if (!currentCategory) {
      return;
    }

    const stillValid = filteredCategories.some((category) => category.id === currentCategory);
    if (!stillValid) {
      form.setValue("categoryId", "");
    }
  }, [filteredCategories, form]);

  const resetForm = () => {
    setSelectedTransaction(null);
    form.reset({
      title: "",
      amount: 0,
      type: "EXPENSE",
      categoryId: "",
      transactionDate: new Date().toISOString().slice(0, 10),
      notes: "",
    });
  };

  const mutation = useMutation({
    mutationFn: async (values: TransactionFormPayload) => {
      const payload = {
        ...values,
        transactionDate: new Date(values.transactionDate).toISOString(),
      };

      if (selectedTransaction) {
        return endpoints.updateTransaction(selectedTransaction.id, payload);
      }

      return endpoints.createTransaction(payload);
    },
    onSuccess: () => {
      toast.success(selectedTransaction ? "Transaction updated." : "Transaction added.");
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      void queryClient.invalidateQueries({ queryKey: ["category-breakdown"] });
      void queryClient.invalidateQueries({ queryKey: ["monthly-trends"] });
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save transaction");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => endpoints.deleteTransaction(id),
    onSuccess: () => {
      toast.success("Transaction deleted.");
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      void queryClient.invalidateQueries({ queryKey: ["category-breakdown"] });
      void queryClient.invalidateQueries({ queryKey: ["monthly-trends"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to delete transaction");
    },
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));
  const currencyCode = user?.currency ?? "USD";
  const visibleTransactions = transactionsQuery.data?.data ?? [];
  const visibleIncome = visibleTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const visibleExpense = visibleTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const activeFilterCount = [deferredSearch, typeFilter !== "ALL", selectedCategory].filter(Boolean).length;
  const monthOptions = getRecentMonthOptions(12);

  return (
    <div className="space-y-4">
      <section className="dashboard-panel rounded-[32px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="chip">Transaction workspace</div>
            <h1 className="section-title mt-4 text-3xl font-semibold sm:text-[2.3rem]">
              Manage income and expenses with less friction
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Search, filter, edit, export, and review transaction activity for {formatMonthLabel(selectedMonth)} from one cleaner control panel.
            </p>
          </div>

          <label className="field-shell flex min-w-[230px] items-center gap-3">
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setPage(1);
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
            <p className="text-sm text-[var(--muted)]">Visible income</p>
            <p className="section-title mt-2 text-2xl font-semibold text-emerald-600">
              {currency(visibleIncome, currencyCode)}
            </p>
          </div>
          <div className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">Visible expenses</p>
            <p className="section-title mt-2 text-2xl font-semibold text-rose-500">
              {currency(visibleExpense, currencyCode)}
            </p>
          </div>
          <div className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--muted)]">Active filters</p>
            <p className="section-title mt-2 text-2xl font-semibold">{activeFilterCount}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {transactionsQuery.data?.meta.total ?? 0} results in this filtered view
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="dashboard-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">Add or update</p>
              <h2 className="section-title text-2xl font-semibold">Transaction form</h2>
            </div>
            {selectedTransaction ? (
              <button type="button" onClick={resetForm} className="btn-secondary px-3 py-2 text-xs">
                Clear edit
              </button>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <input {...form.register("title")} placeholder="Monthly salary, rent, groceries..." className="field-shell w-full" />
              {form.formState.errors.title ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Amount</label>
                <input {...form.register("amount")} type="number" step="0.01" placeholder="0.00" className="field-shell w-full" />
                {form.formState.errors.amount ? (
                  <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.amount.message}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Date</label>
                <input {...form.register("transactionDate")} type="date" className="field-shell w-full" />
                {form.formState.errors.transactionDate ? (
                  <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.transactionDate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Type</label>
                <select {...form.register("type")} className="field-shell w-full">
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select {...form.register("categoryId")} className="field-shell w-full">
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.categoryId ? (
                  <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.categoryId.message}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                {...form.register("notes")}
                rows={4}
                placeholder="Optional details for context"
                className="field-shell w-full resize-none"
              />
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary h-12 w-full">
              <Plus className="h-4 w-4" />
              {mutation.isPending ? "Saving..." : selectedTransaction ? "Update transaction" : "Add transaction"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel rounded-[30px] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">History</p>
              <h2 className="section-title text-2xl font-semibold">Transactions</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="field-shell flex min-w-[190px] items-center gap-2">
                <Search className="h-4 w-4 text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search title or notes"
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as "ALL" | "INCOME" | "EXPENSE");
                  setPage(1);
                }}
                className="field-shell min-w-[130px]"
              >
                <option value="ALL">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setPage(1);
                }}
                className="field-shell min-w-[170px]"
              >
                <option value="">All categories</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setSelectedCategory("");
                  setPage(1);
                }}
                className="btn-secondary"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const csv = await apiDownload(`/transactions/export/csv${transactionQueryString}`);
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `transactions-${selectedMonth}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success("CSV exported.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to export CSV");
                  }
                }}
                className="btn-secondary"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-[var(--border)] lg:block">
            <div className="grid grid-cols-[1.5fr_0.9fr_0.7fr_0.7fr_0.5fr] gap-3 bg-white/60 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] dark:bg-slate-950/25">
              <span>Transaction</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Actions</span>
            </div>

            {transactionsQuery.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingSkeleton key={index} className="h-18 w-full rounded-[20px]" />
                ))}
              </div>
            ) : visibleTransactions.length ? (
              visibleTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[1.5fr_0.9fr_0.7fr_0.7fr_0.5fr] gap-3 border-t border-[var(--border)] px-5 py-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{transaction.title}</p>
                    <p className="mt-1 truncate text-[var(--muted)]">
                      {transaction.notes || "No extra notes"}
                    </p>
                  </div>
                  <div className="font-medium">{transaction.category.name}</div>
                  <div className="text-[var(--muted)]">
                    {format(new Date(transaction.transactionDate), "MMM d, yyyy")}
                  </div>
                  <div
                    className={`text-right font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {currency(transaction.amount, currencyCode)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        form.reset({
                          title: transaction.title,
                          amount: transaction.amount,
                          type: transaction.type,
                          categoryId: transaction.category.id,
                          transactionDate: transaction.transactionDate.slice(0, 10),
                          notes: transaction.notes ?? "",
                        });
                      }}
                      className="btn-secondary px-3 py-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(transaction.id)}
                      className="btn-secondary border-rose-200 bg-rose-50/80 px-3 py-2 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={<FileSearch className="h-5 w-5" />}
                  title="No transactions found"
                  description="Adjust filters or add a new transaction to populate this view."
                />
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 lg:hidden">
            {transactionsQuery.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-28 w-full rounded-[24px]" />
              ))
            ) : visibleTransactions.length ? (
              visibleTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="dashboard-panel rounded-[24px] border border-[var(--border)] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{transaction.title}</p>
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
                  {transaction.notes ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{transaction.notes}</p>
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        form.reset({
                          title: transaction.title,
                          amount: transaction.amount,
                          type: transaction.type,
                          categoryId: transaction.category.id,
                          transactionDate: transaction.transactionDate.slice(0, 10),
                          notes: transaction.notes ?? "",
                        });
                      }}
                      className="btn-secondary flex-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(transaction.id)}
                      className="btn-secondary border-rose-200 bg-rose-50/80 px-4 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<FileSearch className="h-5 w-5" />}
                title="No transactions found"
                description="Adjust filters or add a new transaction to populate this view."
              />
            )}
          </div>

          {transactionsQuery.data ? (
            <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Page {transactionsQuery.data.meta.page} of {transactionsQuery.data.meta.totalPages || 1}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="btn-secondary px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= transactionsQuery.data.meta.totalPages}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, transactionsQuery.data?.meta.totalPages ?? prev),
                    )
                  }
                  className="btn-secondary px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
