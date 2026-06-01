import { ReactNode } from "react";
import { motion } from "framer-motion";

export function StatCard({
  title,
  value,
  helper,
  icon,
  accent = "var(--accent)",
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="dashboard-panel rounded-[30px] p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
          <h3 className="section-title mt-3 text-3xl font-semibold tracking-tight sm:text-[2rem]">{value}</h3>
          <p className="mt-2 max-w-[22ch] text-sm leading-6 text-[var(--muted)]">{helper}</p>
        </div>
        <div
          className="rounded-2xl p-3 shadow-sm"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
