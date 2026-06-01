"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: signUp, token } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [router, token]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to register");
    }
  });

  return (
    <main className="grid min-h-screen gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="dashboard-panel rounded-[36px] px-7 py-8 sm:px-10 sm:py-10"
      >
        <div className="mx-auto max-w-md">
          <div className="chip">Build your workspace</div>
          <h1 className="section-title mt-6 text-4xl font-semibold">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Set up your personal finance dashboard and start tracking income, expenses, and budgets with a cleaner workflow.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full name</label>
              <input {...register("name")} placeholder="Your full name" className="field-shell w-full" />
              {errors.name ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.name.message}</p>
              ) : null}
            </div>
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
                  placeholder="Choose a secure password"
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
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)]">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>

      <section className="dashboard-panel grid-fade relative overflow-hidden rounded-[36px] px-7 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_36%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Built for polished delivery</p>
            <h2 className="section-title mt-6 text-5xl font-semibold leading-tight">
              Professional finish, practical daily value.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              This project is designed to feel calm, premium, and useful on every screen size while keeping the backend integration dependable.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Responsive layout",
                  text: "Works smoothly across desktop, tablet, and mobile.",
                  icon: <Layers3 className="h-5 w-5" />,
                },
                {
                  label: "Secure auth",
                  text: "Protected flows with JWT and profile persistence.",
                  icon: <BadgeCheck className="h-5 w-5" />,
                },
                {
                  label: "Clear insights",
                  text: "Analytics and budgets built for quick financial context.",
                  icon: <ShieldCheck className="h-5 w-5" />,
                },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="dashboard-panel rounded-[26px] border border-[var(--border)] p-4"
                >
                  <div className="mb-3 inline-flex rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                    {feature.icon}
                  </div>
                  <p className="font-semibold">{feature.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-[28px] border border-[var(--border)] bg-white/52 px-5 py-4 text-sm text-[var(--muted)] dark:bg-slate-950/22">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Designed to be strong enough for your resume, not just a classroom demo.
          </div>
        </div>
      </section>
    </main>
  );
}
