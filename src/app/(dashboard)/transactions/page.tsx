"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { apiDownload, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Transaction } from "@/lib/types";
import { currency } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().min(0),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1),
  transactionDate: z.string().min(1),
  notes: z.string().optional(),
});

type TransactionFormValues = z.input<typeof schema>;
type TransactionFormPayload = z.output<typeof schema>;

const currentMonth = new Date().toISOString().slice(0, 7);

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
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [selectedCategory, setSelectedCategory] = useState("");
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
    const { startDate, endDate } = getMonthRange(currentMonth);
    params.set("page", String(page));
    params.set("limit", "8");
    if (search) params.set("search", search);
    if (typeFilter !== "ALL") params.set("type", typeFilter);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    return `?${params.toString()}`;
  }, [page, search, selectedCategory, typeFilter]);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", transactionQueryString],
    queryFn: () => endpoints.transactions(transactionQueryString),
  });

  const filteredCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.type === watchedType),
    [categoriesQuery.data, watchedType],
  );

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
    },
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));
  const currencyCode = user?.currency ?? "USD";

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-card rounded-[30px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">Add or update</p>
            <h2 className="section-title text-2xl font-semibold">Transaction form</h2>
          </div>
          {selectedTransaction ? (
            <button type="button" onClick={resetForm} className="text-sm font-medium text-[var(--accent)]">
              Clear edit
            </button>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input {...form.register("title")} placeholder="Title" className="field-shell w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input {...form.register("amount")} type="number" step="0.01" placeholder="Amount" className="field-shell w-full" />
            <input {...form.register("transactionDate")} type="date" className="field-shell w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select {...form.register("type")} className="field-shell w-full">
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <select {...form.register("categoryId")} className="field-shell w-full">
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <textarea {...form.register("notes")} rows={4} placeholder="Notes" className="field-shell w-full resize-none" />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {mutation.isPending ? "Saving..." : selectedTransaction ? "Update transaction" : "Add transaction"}
          </button>
        </form>
      </section>

      <section className="surface-card rounded-[30px] p-6">
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
                placeholder="Search"
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
              onClick={async () => {
                try {
                  const csv = await apiDownload(`/transactions/export/csv${transactionQueryString}`);
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "transactions.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to export CSV");
                }
              }}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[var(--border)] px-4 font-medium"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {transactionsQuery.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-24 w-full rounded-[24px]" />
            ))
          ) : transactionsQuery.data?.data.length ? (
            transactionsQuery.data.data.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-[24px] border border-[var(--border)] bg-white/55 px-4 py-4 dark:bg-slate-950/25"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {transaction.category.name} • {format(new Date(transaction.transactionDate), "PPP")}
                    </p>
                    {transaction.notes ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">{transaction.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {currency(transaction.amount, currencyCode)}
                    </p>
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
                      className="rounded-2xl border border-[var(--border)] p-3"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(transaction.id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No transactions found"
              description="Adjust your filters or add a new transaction to populate this view."
            />
          )}
        </div>

        {transactionsQuery.data ? (
          <div className="mt-6 flex items-center justify-between text-sm text-[var(--muted)]">
            <p>
              Page {transactionsQuery.data.meta.page} of {transactionsQuery.data.meta.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-2xl border border-[var(--border)] px-4 py-2 disabled:opacity-40"
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
                className="rounded-2xl border border-[var(--border)] px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
