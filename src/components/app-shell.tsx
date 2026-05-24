"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: WalletCards },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid-fade mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="surface-card hidden rounded-[32px] p-6 lg:flex lg:min-h-[calc(100vh-2rem)] lg:flex-col">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              Expense Tracker Pro
            </p>
            <h1 className="section-title mt-4 text-3xl font-semibold">
              Finance in full clarity
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Premium tracking for income, expenses, budgets, and monthly momentum.
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/20"
                      : "text-[var(--foreground)] hover:bg-white/60 dark:hover:bg-slate-900/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] bg-slate-950 px-5 py-5 text-white dark:bg-slate-50 dark:text-slate-900">
            <p className="text-sm opacity-70">Signed in as</p>
            <p className="mt-2 font-medium">{user?.name ?? "User"}</p>
            <p className="text-sm opacity-70">{user?.email}</p>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="surface-card rounded-[32px] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Welcome back</p>
                <h2 className="section-title text-2xl font-semibold">
                  {user?.name ?? "Your workspace"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-4 text-sm font-medium text-[var(--foreground)] transition hover:scale-[1.02] dark:bg-slate-900/60"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "bg-white/70 text-[var(--foreground)] dark:bg-slate-900/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-4"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
