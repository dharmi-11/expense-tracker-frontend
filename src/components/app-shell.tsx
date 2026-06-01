"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, formatMonthLabel } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, blurb: "Overview and health" },
  { href: "/transactions", label: "Transactions", icon: WalletCards, blurb: "Income and expense history" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, blurb: "Trends and category signals" },
  { href: "/budgets", label: "Budgets", icon: PiggyBank, blurb: "Targets and spending discipline" },
  { href: "/settings", label: "Settings", icon: Settings, blurb: "Profile and preferences" },
];

function getActiveItem(pathname: string) {
  return (
    navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navigation[0]
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const activeItem = getActiveItem(pathname);
  const currentMonth = formatMonthLabel(new Date().toISOString().slice(0, 7));

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid-fade relative mx-auto grid max-w-7xl gap-4 lg:grid-cols-[292px_1fr]">
        <aside className="dashboard-panel hidden rounded-[34px] p-6 lg:flex lg:min-h-[calc(100vh-2rem)] lg:flex-col">
          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/25 dark:bg-[linear-gradient(135deg,#05261f,#0b3a2e)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60">Expense Tracker Pro</p>
                  <p className="mt-1 text-lg font-semibold">Personal finance cockpit</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-4">
              <p className="text-sm text-white/65">This month</p>
              <p className="section-title mt-2 text-2xl font-semibold text-white">{currentMonth}</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Keep budgets visible, review cash flow quickly, and act on trends with less friction.
              </p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem.href === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-[26px] border px-4 py-4 transition duration-200",
                    isActive
                      ? "border-transparent bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/20"
                      : "border-transparent bg-white/40 text-[var(--foreground)] hover:border-[var(--border)] hover:bg-white/70 dark:bg-slate-950/20 dark:hover:bg-slate-950/45",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-2xl p-3 transition",
                        isActive
                          ? "bg-white/14 text-white"
                          : "bg-[var(--accent-soft)] text-[var(--accent)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={cn(
                          "text-xs",
                          isActive ? "text-white/72" : "text-[var(--muted)]",
                        )}
                      >
                        {item.blurb}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition",
                      isActive ? "text-white/72" : "text-[var(--muted)] group-hover:translate-x-0.5",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-[var(--border)] bg-white/55 p-5 dark:bg-slate-950/30">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Signed in as</p>
            <p className="mt-3 text-lg font-semibold">{user?.name ?? "User"}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{user?.email}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-[var(--muted)]">
              <CalendarDays className="h-4 w-4" />
              <span>Tracking period: {currentMonth}</span>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="dashboard-panel rounded-[34px] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="chip">Modern fintech dashboard</div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <span>Workspace</span>
                  <ChevronRight className="h-4 w-4" />
                  <span>{activeItem.label}</span>
                </div>
                <h2 className="section-title mt-3 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
                  {activeItem.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {activeItem.blurb}. Designed to keep daily money management crisp, calm, and actionable.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3 text-sm text-[var(--muted)] dark:bg-slate-950/30">
                  <p className="font-medium text-[var(--foreground)]">{user?.name ?? "Your workspace"}</p>
                  <p>{currentMonth}</p>
                </div>
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="btn-secondary h-11"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem.href === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/15"
                        : "border border-[var(--border)] bg-white/66 text-[var(--foreground)] dark:bg-slate-950/35",
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
