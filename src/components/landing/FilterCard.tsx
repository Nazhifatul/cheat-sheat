import * as React from "react";

import * as Button from "@/ui/button";
import * as Input from "@/ui/input";
import { cn } from "@/utils/cn";
import type { SortMode } from "@/utils/wordsView";

export type FilterState = {
  sortMode: SortMode;
  minLen: number | null;
  maxLen: number | null;
  limit: number;
};

export function FilterCard({
  value,
  onChange,
  onReset,
  className,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  className?: string;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-slate-900/10 bg-white/88 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-slate-500">
            FILTER
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            Filter hasil
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Opsi ringkas buat urutan, panjang kata, dan jumlah hasil.
          </p>
        </div>
        <Button.Root variant="neutral" mode="stroke" size="sm" onClick={onReset}>
          Reset
        </Button.Root>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Button.Root
            variant="neutral"
            mode={value.sortMode === "az" ? "filled" : "stroke"}
            size="sm"
            onClick={() => set({ sortMode: "az" })}
            className={value.sortMode === "az" ? "bg-[#0f766e] text-white hover:bg-[#115e59]" : ""}
          >
            A–Z
          </Button.Root>
          <Button.Root
            variant="neutral"
            mode={value.sortMode === "recent" ? "filled" : "stroke"}
            size="sm"
            onClick={() => set({ sortMode: "recent" })}
            className={value.sortMode === "recent" ? "bg-slate-950 text-white hover:bg-slate-800" : ""}
          >
            Terbaru
          </Button.Root>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Min</p>
            <Input.Root
              uiSize="md"
              inputMode="numeric"
              value={value.minLen ?? ""}
              placeholder="0"
              className="h-10 rounded-xl"
              onChange={(e) => {
                const v = e.target.value.trim();
                set({ minLen: v ? Number(v) : null });
              }}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Max</p>
            <Input.Root
              uiSize="md"
              inputMode="numeric"
              value={value.maxLen ?? ""}
              placeholder="∞"
              className="h-10 rounded-xl"
              onChange={(e) => {
                const v = e.target.value.trim();
                set({ maxLen: v ? Number(v) : null });
              }}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Limit</p>
            <Input.Root
              uiSize="md"
              inputMode="numeric"
              className="h-10 rounded-xl"
              value={String(value.limit)}
              onChange={(e) => {
                const v = e.target.value.trim();
                set({ limit: v ? Number(v) : 200 });
              }}
            />
          </div>
        </div>

        <p className="text-[11px] leading-5 text-slate-500">
          Klik kata untuk menyalin. Hasil maksimal 5000 item.
        </p>
      </div>
    </div>
  );
}
