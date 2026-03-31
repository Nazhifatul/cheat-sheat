import * as React from "react";

import { cn } from "@/utils/cn";

export type BadgeTone = "neutral" | "info" | "success" | "danger";

export type StatusBadge = {
  label: string;
  value: string;
  tone?: BadgeTone;
};

const toneClass: Record<BadgeTone, string> = {
  neutral:
    "border-slate-200/70 bg-white/75 text-slate-700 supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-white/80",
  info:
    "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-[#7DD3FC]/25 dark:bg-[#7DD3FC]/10 dark:text-[#D9F2FF]",
  success:
    "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-[#34D399]/25 dark:bg-[#34D399]/10 dark:text-[#D7FFE9]",
  danger:
    "border-rose-200/70 bg-rose-50 text-rose-800 dark:border-[#FB7185]/25 dark:bg-[#FB7185]/10 dark:text-[#FFE1E6]",
};

export function StatusBadgesRow({
  badges,
  className,
}: {
  badges: StatusBadge[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges.map((b) => (
        <div
          key={b.label}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur",
            toneClass[b.tone ?? "neutral"],
          )}
        >
          <span className="font-mono tracking-wide text-slate-500 dark:text-white/60">
            {b.label}
          </span>
          <span className="font-mono text-slate-900 dark:text-white/90">
            {b.value}
          </span>
        </div>
      ))}
    </div>
  );
}
