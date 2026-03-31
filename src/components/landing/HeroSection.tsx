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
  sysLabel = "SK.V1 // LIVE",
  title = "Sambung Kata",
  subtitle =
    "Cari kata/kalimat secara real-time, import dari file, dan sinkron otomatis antar perangkat.",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 px-6 py-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-[#0B0F14] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(1200px_circle_at_30%_-10%,rgba(125,211,252,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_0%,rgba(255,184,107,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] dark:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_-20%,rgba(125,211,252,0.16),transparent_55%),radial-gradient(700px_circle_at_90%_0%,rgba(255,184,107,0.14),transparent_55%)] opacity-60 dark:hidden" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.22),transparent_60%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,184,107,0.18),transparent_60%)] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-slate-500 dark:text-white/60">
              {sysLabel}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              <span className="bg-gradient-to-b from-slate-950 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-white/75">
                {title}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              {subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button.Root onClick={onCtaClick} className="min-w-32">
                Mulai
              </Button.Root>
              <a
                href="#hasil"
                className="text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-white/70 dark:hover:text-white"
              >
                Lihat hasil
              </a>
            </div>
          </div>

          <div className="hidden w-[320px] shrink-0 rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:block">
            <p className="font-mono text-xs text-slate-700 dark:text-white/80">Cara cepat</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-white/70">
              <li>1) Ketik awalan kata</li>
              <li>2) Atur filter jika perlu</li>
              <li>3) Klik chip untuk salin</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
