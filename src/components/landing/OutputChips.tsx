import * as React from "react";

import { cn } from "@/utils/cn";

export type OutputChipsProps = {
  id?: string;
  title?: string;
  isLoading: boolean;
  query: string;
  suffixQuery?: string;
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
  suffixQuery = "",
  totalUnique,
  matched,
  items,
  onCopy,
  className,
}: OutputChipsProps) {
  const emptyQuery = !query.trim() && !suffixQuery.trim();
  const showEmpty = !items.length;
  const activePattern =
    query.trim() || suffixQuery.trim()
      ? `${query.trim() || "…"} • ${suffixQuery.trim() || "…"}`
      : "semua kata";

  return (
    <section
      id={id}
      className={cn(
        "flex h-full min-h-0 flex-col lg:max-h-[calc(100vh-14rem)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-slate-500">
            HASIL LIVE
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Pola aktif: <span className="font-mono text-slate-900">{activePattern}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-slate-50/90 px-3 py-2 text-xs text-slate-700">
          <div>
            <span className="block font-mono text-[11px] tracking-[0.2em] text-slate-500">
              MATCHED
            </span>
            <span className="mt-1 block font-mono text-base text-slate-950">{matched}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="block font-mono text-[11px] tracking-[0.2em] text-slate-500">
              TOTAL
            </span>
            <span className="mt-1 block font-mono text-base text-slate-950">{totalUnique}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white/88 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-600">
            Memuat kamus…
          </div>
        ) : showEmpty ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-600">
            {emptyQuery
              ? "Belum ada hasil. Isi awalan kata atau kata akhir untuk mulai menyaring."
              : "Tidak ada hasil. Coba ubah awalan, akhiran, atau filter panjang kata."}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((w) => (
                <button
                  key={w.toLocaleLowerCase()}
                  type="button"
                  onClick={() => onCopy(w)}
                  className="group relative overflow-hidden rounded-[1.15rem] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] px-3 py-3 text-left text-sm text-slate-900 transition-transform transition-colors hover:-translate-y-0.5 hover:border-[#0f766e]/30 hover:bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(255,247,237,0.96))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                >
                  <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0f766e] to-[#f97316]" />
                  <span className="block min-h-12 break-words pl-2 pr-1 font-mono text-[15px] leading-6 whitespace-normal">
                    {w}
                  </span>
                  <span className="mt-1 block pl-2 text-[10px] uppercase tracking-[0.24em] text-slate-400 transition-colors group-hover:text-slate-500">
                    copy
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
