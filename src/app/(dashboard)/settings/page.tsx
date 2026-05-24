"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Save, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  name: z.string().min(2),
  currency: z.string().min(3).max(3),
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
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Profile</p>
        <h2 className="section-title text-2xl font-semibold">Personal settings</h2>

        <form
          onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
          className="mt-6 space-y-4"
        >
          <input {...form.register("name")} placeholder="Full name" className="field-shell w-full" />
          <input {...form.register("currency")} placeholder="Currency code" className="field-shell w-full uppercase" />
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 font-medium text-white"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </form>
      </section>

      <section className="surface-card rounded-[30px] p-6">
        <p className="text-sm text-[var(--muted)]">Environment</p>
        <h2 className="section-title text-2xl font-semibold">Integration status</h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4 dark:bg-slate-950/25">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Connected API</p>
                <p className="text-sm text-[var(--muted)]">
                  {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-white/55 p-4 dark:bg-slate-950/25">
            <p className="font-medium">Signed in as</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{user?.email}</p>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Update your display name or preferred currency here. The dashboard and
              transaction views will reflect the new currency formatting immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
