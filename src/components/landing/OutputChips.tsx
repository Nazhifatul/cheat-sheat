import * as React from "react";

import { cn } from "@/utils/cn";

export type OutputChipsProps = {
  id?: string;
  title?: string;
  isLoading: boolean;
  query: string;
  totalUnique: number;
  matched: number;
  items: string[];
  onCopy: (value: string) => void;
  className?: string;
};

export function OutputChips({
  id,
  title = "Hasil",
  isLoading,
  query,
  totalUnique,
  matched,
  items,
  onCopy,
  className,
}: OutputChipsProps) {
  const emptyQuery = !query.trim();
  const showEmpty = !items.length;

  return (
    <section id={id} className={cn("rounded-3xl", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
            &gt;&gt; DATA_OUTPUT
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white/90">
            {title}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/75 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-none">
          <span className="font-mono">{matched}</span>
          <span className="text-slate-400 dark:text-white/50">/</span>
          <span className="font-mono text-slate-500 dark:text-white/60">{totalUnique}</span>
          <span className="text-slate-400 dark:text-white/50">hasil</span>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-600 dark:text-white/65">
            Memuat kamus…
          </div>
        ) : showEmpty ? (
          <div className="py-10 text-center text-sm text-slate-600 dark:text-white/65">
            {emptyQuery
              ? "Belum ada hasil — ketik awalan kata untuk memfilter."
              : "Tidak ada hasil — coba ubah awalan atau filter."}
          </div>
        ) : (
          <div className="max-h-[44vh] overflow-auto pr-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {items.map((w) => (
                <button
                  key={w.toLocaleLowerCase()}
                  type="button"
                  onClick={() => onCopy(w)}
                  className="group relative rounded-2xl border border-slate-200/70 bg-slate-950/[0.03] px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-sky-200 hover:bg-slate-950/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 dark:border-white/10 dark:bg-black/20 dark:text-white/85 dark:hover:border-[#7DD3FC]/35 dark:hover:bg-black/30 dark:focus-visible:ring-[#7DD3FC]/35"
                >
                  <span className="block truncate font-mono">{w}</span>
                  <span className="pointer-events-none absolute inset-x-3 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-[#7DD3FC]/60" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
