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
        "rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
            FILTER
          </p>
          <h3 className="mt-2 text-sm font-semibold text-slate-950 dark:text-white/90">
            Atur hasil
          </h3>
        </div>
        <Button.Root variant="neutral" mode="stroke" size="sm" onClick={onReset}>
          Reset
        </Button.Root>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Button.Root
            variant="neutral"
            mode={value.sortMode === "az" ? "lighter" : "stroke"}
            size="sm"
            onClick={() => set({ sortMode: "az" })}
          >
            A–Z
          </Button.Root>
          <Button.Root
            variant="neutral"
            mode={value.sortMode === "recent" ? "lighter" : "stroke"}
            size="sm"
            onClick={() => set({ sortMode: "recent" })}
          >
            Terbaru
          </Button.Root>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-xs text-slate-600 dark:text-white/60">Min len</p>
            <Input.Root
              uiSize="md"
              inputMode="numeric"
              value={value.minLen ?? ""}
              placeholder="0"
              onChange={(e) => {
                const v = e.target.value.trim();
                set({ minLen: v ? Number(v) : null });
              }}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-600 dark:text-white/60">Max len</p>
            <Input.Root
              uiSize="md"
              inputMode="numeric"
              value={value.maxLen ?? ""}
              placeholder="∞"
              onChange={(e) => {
                const v = e.target.value.trim();
                set({ maxLen: v ? Number(v) : null });
              }}
            />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-slate-600 dark:text-white/60">Batas hasil</p>
          <Input.Root
            uiSize="md"
            inputMode="numeric"
            value={String(value.limit)}
            onChange={(e) => {
              const v = e.target.value.trim();
              set({ limit: v ? Number(v) : 200 });
            }}
          />
          <p className="mt-2 text-[11px] text-slate-500 dark:text-white/45">
            Klik chip untuk menyalin.
          </p>
        </div>
      </div>
    </div>
  );
}
