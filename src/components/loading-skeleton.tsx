export function LoadingSkeleton({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-slate-200/70 via-slate-100/80 to-slate-200/70 dark:from-slate-800/70 dark:via-slate-700/50 dark:to-slate-800/70 ${className}`}
    />
  );
}
