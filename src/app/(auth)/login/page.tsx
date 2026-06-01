"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, token } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
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
    <main className="grid min-h-screen gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
      <section className="dashboard-panel grid-fade relative overflow-hidden rounded-[36px] px-7 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.18),transparent_34%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="max-w-2xl">
            <div className="chip">Final internship project</div>
            <h1 className="section-title mt-6 text-5xl font-semibold leading-tight">
              Track money with the clarity of a modern finance workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              Expense Tracker Pro keeps transactions, budgets, and analytics in one polished place so you can move from logging numbers to making better decisions.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Live analytics",
                  text: "Understand trends quickly with focused charts and clean summaries.",
                  icon: <ChartNoAxesCombined className="h-5 w-5" />,
                },
                {
                  title: "Budget focus",
                  text: "Stay aware of monthly limits before overspending sneaks in.",
                  icon: <Wallet className="h-5 w-5" />,
                },
                {
                  title: "Secure access",
                  text: "JWT auth and protected routes keep the workspace private.",
                  icon: <ShieldCheck className="h-5 w-5" />,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4"
                >
                  <div className="mb-3 inline-flex rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                    {item.icon}
                  </div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-[28px] border border-[var(--border)] bg-white/52 px-5 py-4 text-sm text-[var(--muted)] dark:bg-slate-950/22">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Resume-ready UI, deployed API, and working protected flows.
          </div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="dashboard-panel rounded-[36px] px-7 py-8 sm:px-10 sm:py-10"
      >
        <div className="mx-auto max-w-md">
          <p className="text-sm font-medium text-[var(--muted)]">Welcome back</p>
          <h2 className="section-title mt-2 text-4xl font-semibold">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Use your own credentials or jump in with the live demo account.
          </p>

          <div className="mt-6 rounded-[26px] border border-emerald-500/18 bg-emerald-500/8 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Demo account</p>
                <p className="mt-2 text-[var(--muted)]">demo@expensetracker.pro</p>
                <p className="text-[var(--muted)]">Passw0rd!2026</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("email", "demo@expensetracker.pro");
                  setValue("password", "Passw0rd!2026");
                  toast.success("Demo credentials filled.");
                }}
                className="btn-secondary shrink-0 px-3 py-2 text-xs"
              >
                Use demo
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email address</label>
              <input
                {...register("email")}
                placeholder="name@example.com"
                className="field-shell w-full"
              />
              {errors.email ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <div className="field-shell flex items-center gap-3">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.password.message}</p>
              ) : null}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-[var(--accent)]">
              Create one
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
  );
}
