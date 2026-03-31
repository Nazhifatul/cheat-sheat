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
    "border-slate-900/10 bg-white/80 text-slate-700",
  info:
    "border-cyan-900/10 bg-cyan-50 text-cyan-800",
  success:
    "border-emerald-900/10 bg-emerald-50 text-emerald-800",
  danger:
    "border-rose-900/10 bg-rose-50 text-rose-800",
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
            "inline-flex items-center gap-3 rounded-2xl border px-3 py-2 text-xs shadow-sm backdrop-blur",
            toneClass[b.tone ?? "neutral"],
          )}
        >
          <span className="font-mono tracking-[0.22em] text-slate-500">
            {b.label}
          </span>
          <span className="font-mono text-slate-900">
            {b.value}
          </span>
        </div>
      ))}
    </div>
  );
}
