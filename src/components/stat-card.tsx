import { ReactNode } from "react";
import { motion } from "framer-motion";

export function StatCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="surface-card rounded-[30px] p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{title}</p>
          <h3 className="section-title mt-3 text-3xl font-semibold">{value}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">{icon}</div>
      </div>
    </motion.div>
  );
}
