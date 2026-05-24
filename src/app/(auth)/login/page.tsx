"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, ChartNoAxesCombined, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, token } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [router, token]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to login");
    }
  });

  return (
    <main className="grid min-h-screen gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section className="surface-card grid-fade relative overflow-hidden rounded-[36px] px-7 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.15),transparent_34%)]" />
        <div className="relative z-10 max-w-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Expense Tracker Pro
          </p>
          <h1 className="section-title mt-6 text-5xl font-semibold leading-tight">
            Move from scattered spending to confident financial decisions.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
            Track every transaction, monitor budgets, and surface monthly trends in a
            refined workspace built for clarity.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Live analytics",
                icon: <ChartNoAxesCombined className="h-5 w-5" />,
              },
              { title: "Budget focus", icon: <Wallet className="h-5 w-5" /> },
              { title: "Secure access", icon: <ShieldCheck className="h-5 w-5" /> },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[var(--border)] bg-white/60 p-4 dark:bg-slate-950/30">
                <div className="mb-3 inline-flex rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  {item.icon}
                </div>
                <p className="text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="surface-card rounded-[36px] px-7 py-8 sm:px-10 sm:py-10"
      >
        <div className="mx-auto max-w-md">
          <p className="text-sm text-[var(--muted)]">Welcome back</p>
          <h2 className="section-title mt-2 text-4xl font-semibold">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Use the demo account or your own credentials to continue.
          </p>

          <div className="mt-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Demo account</p>
            <p className="mt-1 text-[var(--muted)]">Email: `demo@expensetracker.pro`</p>
            <p className="text-[var(--muted)]">Password: `Passw0rd!2026`</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <input
                {...register("email")}
                placeholder="Email address"
                className="field-shell w-full"
              />
              {errors.email ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="field-shell w-full"
              />
              {errors.password ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.password.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-[var(--accent)]">
              Create one
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
  );
}
