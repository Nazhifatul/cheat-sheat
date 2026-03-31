import * as React from "react";

import * as Button from "@/ui/button";
import { cn } from "@/utils/cn";

export type HeroSectionProps = {
  onCtaClick: () => void;
  sysLabel?: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

export function HeroSection({
  onCtaClick,
  sysLabel = "CHEATWORDS // WORD STUDIO",
  title = "Sambung Kata",
  subtitle =
    "Cari kata/kalimat secara real-time, import dari file, dan sinkron otomatis antar perangkat.",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(236,253,245,0.84)_42%,rgba(240,249,255,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
      <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#0f766e]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#f97316]/12 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-start">
        <div>
          <p className="font-mono text-[11px] tracking-[0.34em] text-slate-600">
            {sysLabel}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-none tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button.Root
              onClick={onCtaClick}
              className="min-w-36 bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-800"
            >
              Mulai Filter
            </Button.Root>
            <a
              href="#hasil"
              className="inline-flex h-11 items-center rounded-xl border border-slate-900/10 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-white/60 hover:text-slate-950"
            >
              Lihat hasil
            </a>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur">
              <p className="font-mono text-[11px] tracking-[0.28em] text-slate-500">
                AWALAN
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Temukan kata dari huruf pembuka.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur">
              <p className="font-mono text-[11px] tracking-[0.28em] text-slate-500">
                AKHIRAN
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Saring lagi dengan kata akhir opsional.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur">
              <p className="font-mono text-[11px] tracking-[0.28em] text-slate-500">
                LIVE COPY
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Klik hasil untuk salin super cepat.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.26)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-[0.34em] text-white/60">
              {sysLabel}
            </p>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.24em] text-emerald-300">
              ACTIVE
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[11px] tracking-[0.28em] text-white/50">
                FLOW
              </p>
              <ol className="mt-3 space-y-2 text-sm text-white/82">
                <li>1. Isi awalan kata.</li>
                <li>2. Tambahkan akhiran bila perlu.</li>
                <li>3. Pilih hasil dan langsung copy.</li>
              </ol>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#14b8a6] px-3 py-4 text-slate-950">
                <p className="font-mono text-[10px] tracking-[0.24em] text-slate-800/80">
                  INPUT
                </p>
                <p className="mt-2 text-xl font-semibold">2</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-4">
                <p className="font-mono text-[10px] tracking-[0.24em] text-white/45">
                  FILTER
                </p>
                <p className="mt-2 text-xl font-semibold">LEN</p>
              </div>
              <div className="rounded-2xl bg-[#fb923c] px-3 py-4 text-slate-950">
                <p className="font-mono text-[10px] tracking-[0.24em] text-slate-800/80">
                  COPY
                </p>
                <p className="mt-2 text-xl font-semibold">FAST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
