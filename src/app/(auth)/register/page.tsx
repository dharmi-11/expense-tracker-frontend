"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: signUp, token } = useAuth();
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
    <main className="grid min-h-screen gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <motion.section
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="surface-card rounded-[36px] px-7 py-8 sm:px-10 sm:py-10"
      >
        <div className="mx-auto max-w-md">
          <p className="text-sm text-[var(--muted)]">Start strong</p>
          <h1 className="section-title mt-2 text-4xl font-semibold">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Build a clean financial habit with secure authentication, analytics, and
            premium budgeting views.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <input {...register("name")} placeholder="Full name" className="field-shell w-full" />
              {errors.name ? (
                <p className="mt-2 text-xs text-[var(--danger)]">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <input {...register("email")} placeholder="Email address" className="field-shell w-full" />
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
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[var(--accent)]">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>

      <section className="surface-card grid-fade relative overflow-hidden rounded-[36px] px-7 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_36%)]" />
        <div className="relative z-10 max-w-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Built for capstone quality</p>
          <h2 className="section-title mt-6 text-5xl font-semibold leading-tight">
            Professional polish with practical daily value.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Responsive layout", icon: <Layers3 className="h-5 w-5" /> },
              { label: "Secure auth", icon: <BadgeCheck className="h-5 w-5" /> },
              { label: "Insightful charts", icon: <Sparkles className="h-5 w-5" /> },
            ].map((feature) => (
              <div key={feature.label} className="rounded-[24px] border border-[var(--border)] bg-white/60 p-4 dark:bg-slate-950/30">
                <div className="mb-3 inline-flex rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
