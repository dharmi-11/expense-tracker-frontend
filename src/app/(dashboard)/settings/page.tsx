"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Save, Settings2, ShieldCheck, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  currency: z.string().min(3, "Use a 3-letter currency code").max(3, "Use a 3-letter currency code"),
});

type SettingsFormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, updateProfileState } = useAuth();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(schema),
    values: {
      name: user?.name ?? "",
      currency: user?.currency ?? "USD",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SettingsFormValues) => endpoints.users.update(values),
    onSuccess: (updatedUser) => {
      updateProfileState(updatedUser);
      toast.success("Profile updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <section className="dashboard-panel rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Profile</p>
        <h2 className="section-title text-2xl font-semibold">Personal settings</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Keep your display name and currency preferences aligned with the way you want financial information shown.
        </p>

        <form
          onSubmit={form.handleSubmit((values) =>
            updateMutation.mutate({ ...values, currency: values.currency.toUpperCase() }),
          )}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Full name</label>
            <input {...form.register("name")} placeholder="Full name" className="field-shell w-full" />
            {form.formState.errors.name ? (
              <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Currency code</label>
            <input
              {...form.register("currency")}
              placeholder="USD"
              className="field-shell w-full uppercase"
            />
            {form.formState.errors.currency ? (
              <p className="mt-2 text-xs text-[var(--danger)]">{form.formState.errors.currency.message}</p>
            ) : null}
          </div>

          <button type="submit" disabled={updateMutation.isPending} className="btn-primary h-12 w-full">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save settings"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="dashboard-panel rounded-[30px] p-6">
          <p className="text-sm text-[var(--muted)]">Environment</p>
          <h2 className="section-title text-2xl font-semibold">Integration status</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Connected API</p>
                  <p className="mt-1 text-sm text-[var(--muted)] break-all">
                    {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Account state</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Authenticated and protected by JWT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel rounded-[30px] p-6">
          <p className="text-sm text-[var(--muted)]">Workspace snapshot</p>
          <h2 className="section-title text-2xl font-semibold">Current profile</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Name</p>
                  <p className="font-semibold">{user?.name ?? "User"}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Currency</p>
                  <p className="font-semibold">{user?.currency ?? "USD"}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel rounded-[24px] border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)]">Email</p>
              <p className="mt-2 font-semibold break-all">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
