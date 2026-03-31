"use client";

import * as React from "react";

import * as Button from "@/ui/button";
import * as Card from "@/ui/card";
import * as Input from "@/ui/input";
import * as Label from "@/ui/label";
import {
  sanitizeEntry,
  uniqueWordsCaseInsensitive,
} from "@/utils/filterWords";
import {
  extractTextFromFile,
  splitEntriesFromText,
} from "@/utils/extractTextFromFile";
import { FilterCard, type FilterState } from "@/components/landing/FilterCard";
import { HeroSection } from "@/components/landing/HeroSection";
import { OutputChips } from "@/components/landing/OutputChips";
import { StatusBadgesRow } from "@/components/landing/StatusBadgesRow";
import { SAMPLE_WORDS } from "@/utils/sampleWords";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";
import { computeVisibleWords } from "@/utils/wordsView";

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const el = document.createElement("textarea");
  el.value = value;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function WordCheatSheet() {
  const [query, setQuery] = React.useState("");
  const [newWord, setNewWord] = React.useState("");
  const [words, setWords] = React.useState<string[]>([]);
  const [isLoadingWords, setIsLoadingWords] = React.useState(true);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [manualError, setManualError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({
    sortMode: "recent",
    minLen: null,
    maxLen: null,
    limit: 200,
  });
  const [toast, setToast] = React.useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = React.useState<Date | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const outputRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const client = supabase;
    let isCancelled = false;

    async function loadFromSupabase() {
      if (!client) {
        setWords(uniqueWordsCaseInsensitive(SAMPLE_WORDS));
        setIsLoadingWords(false);
        return;
      }

      setIsLoadingWords(true);
      const pageSize = 1000;
      const maxRows = 20000;
      const collected: string[] = [];
      for (let from = 0; from < maxRows; from += pageSize) {
        const { data, error: fetchError } = await client
          .from("words")
          .select("word")
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);

        if (isCancelled) return;

        if (fetchError) {
          setWords(uniqueWordsCaseInsensitive(SAMPLE_WORDS));
          setIsLoadingWords(false);
          setManualError(
            "Gagal memuat kamus online. Menampilkan data lokal sementara.",
          );
          return;
        }

        const pageWords = (data ?? []).map((row) => row.word);
        collected.push(...pageWords);
        if (pageWords.length < pageSize) break;
      }

      setWords(uniqueWordsCaseInsensitive(collected));
      setIsLoadingWords(false);
      setManualError(null);
      setLastSyncAt(new Date());
    }

    loadFromSupabase();

    if (!client) return;

    const channel = client
      .channel("words-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "words" },
        (payload) => {
          const w = (payload.new as { word?: unknown } | null)?.word;
          if (typeof w === "string") {
            setWords((prev) => uniqueWordsCaseInsensitive([w, ...prev]));
            setLastSyncAt(new Date());
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "words" },
        (payload) => {
          const w = (payload.old as { word?: unknown } | null)?.word;
          if (typeof w === "string") {
            setWords((prev) =>
              prev.filter((x) => x.toLocaleLowerCase() !== w.toLocaleLowerCase()),
            );
            setLastSyncAt(new Date());
          }
        },
      )
      .subscribe();

    return () => {
      isCancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const view = React.useMemo(() => {
    return computeVisibleWords({
      words,
      query,
      sortMode: filters.sortMode,
      minLen: filters.minLen,
      maxLen: filters.maxLen,
      limit: filters.limit,
    });
  }, [filters.limit, filters.maxLen, filters.minLen, filters.sortMode, query, words]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = sanitizeEntry(newWord);
    if (!normalized) {
      setManualError("Kata tidak boleh kosong.");
      return;
    }

    const client = supabase;

    if (!client) {
      setWords((prev) => uniqueWordsCaseInsensitive([normalized, ...prev]));
      setNewWord("");
      setManualError(
        isSupabaseConfigured
          ? "Supabase belum siap. Kata ditambahkan lokal untuk sementara."
          : "Supabase belum dikonfigurasi. Kata ditambahkan lokal untuk sementara.",
      );
      return;
    }

    const { error: insertError } = await client
      .from("words")
      .insert({ word: normalized });

    if (insertError) {
      if (insertError.code === "23505") {
        setManualError("Kata ini sudah ada di kamus.");
        return;
      }
      setManualError("Gagal menyimpan kata. Coba lagi.");
      return;
    }

    setWords((prev) => uniqueWordsCaseInsensitive([normalized, ...prev]));
    setNewWord("");
    setManualError(null);
    setLastSyncAt(new Date());
  }

  async function onImport() {
    if (!importFile) return;
    setIsImporting(true);
    setImportStatus(null);
    setImportError(null);

    try {
      const rawText = await extractTextFromFile(importFile);
      const candidates = splitEntriesFromText(rawText)
        .map((v) => sanitizeEntry(v))
        .filter(Boolean);

      const maxLen = 256;
      let skippedTooLong = 0;
      const expanded: string[] = [];

      for (const c of candidates) {
        if (c.length <= maxLen) {
          expanded.push(c);
          continue;
        }

        const pieces = c
          .split(/[.!?]+/g)
          .map((x) => x.trim())
          .filter(Boolean);
        if (!pieces.length) {
          skippedTooLong += 1;
          continue;
        }

        for (const p of pieces) {
          const clean = sanitizeEntry(p);
          if (!clean) continue;
          if (clean.length <= maxLen) expanded.push(clean);
          else skippedTooLong += 1;
        }
      }

      const entries = uniqueWordsCaseInsensitive(expanded);

      if (!entries.length) {
        setImportStatus("Tidak ada teks yang bisa diimpor dari file.");
        return;
      }

      const client = supabase;
      if (!client) {
        setWords((prev) => uniqueWordsCaseInsensitive([...entries, ...prev]));
        setImportStatus(
          "Supabase belum aktif. Data diimpor lokal untuk sementara.",
        );
        return;
      }

      const rows = entries.map((word) => ({ word }));
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        setImportStatus(
          `Mengimpor ${Math.min(i + chunkSize, rows.length)}/${rows.length}…`,
        );
        const { error: upsertError } = await client
          .from("words")
          .upsert(chunk, { onConflict: "word_lc", ignoreDuplicates: true });

        if (upsertError) {
          const extra = upsertError.code ? ` (${upsertError.code})` : "";
          setImportError(
            `Gagal impor sebagian data. ${upsertError.message}${extra}`,
          );
          return;
        }
      }

      setWords((prev) => uniqueWordsCaseInsensitive([...entries, ...prev]));
      setImportStatus(
        `Import selesai: ${entries.length} entri diproses (duplikat otomatis diabaikan).${skippedTooLong ? ` ${skippedTooLong} entri terlalu panjang di-skip.` : ""}`,
      );
      setImportFile(null);
      setLastSyncAt(new Date());
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal membaca file.";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  }

  React.useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function focusInput() {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function focusOutput() {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onCopy(value: string) {
    try {
      await copyText(value);
      setToast(`Disalin: ${value}`);
    } catch {
      setToast("Gagal menyalin.");
    }
  }

  const modeBadge = supabase
    ? { label: "MODE", value: "ONLINE", tone: "success" as const }
    : {
        label: "MODE",
        value: isSupabaseConfigured ? "OFFLINE" : "LOCAL",
        tone: "info" as const,
      };

  const lastSyncLabel = lastSyncAt
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(lastSyncAt)
    : "-";

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <HeroSection onCtaClick={focusInput} />

        <StatusBadgesRow
          className="mt-4"
          badges={[
            modeBadge,
            { label: "TOTAL", value: String(view.totalUnique), tone: "neutral" },
            { label: "HASIL", value: String(view.matched), tone: "info" },
            { label: "LIMIT", value: String(filters.limit), tone: "neutral" },
            { label: "SYNC", value: lastSyncLabel, tone: "neutral" },
          ]}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-7">
            <Card.Root className="rounded-3xl border-slate-200/70 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5">
              <Card.Header>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
                      INPUT
                    </p>
                    <h2 className="mt-2 text-sm font-semibold text-slate-950 dark:text-white/90">
                      Kata/Frasa Awal
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
                      Hasil muncul saat mengetik (startsWith, tidak peka huruf besar/kecil).
                    </p>
                  </div>
                  <Button.Root
                    variant="neutral"
                    mode="stroke"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      focusInput();
                    }}
                  >
                    Clear
                  </Button.Root>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Label.Root htmlFor="search" className="sr-only">
                      Kata/Frasa awal
                    </Label.Root>
                    <Input.Root
                      ref={inputRef}
                      id="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") focusOutput();
                      }}
                      placeholder='Contoh: "A", "AN", "ANT"'
                      autoComplete="off"
                      className="h-12"
                    />
                  </div>
                  <Button.Root
                    className="h-12 sm:w-36"
                    onClick={focusOutput}
                    disabled={!query.trim()}
                  >
                    Proses
                  </Button.Root>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-600 dark:text-white/60">
                    {!query.trim()
                      ? "Ketik awalan untuk memfilter."
                      : `Menampilkan untuk: “${query.trim()}”`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/45">
                    {supabase
                      ? "Tersimpan di Supabase dan tersinkron real-time."
                      : "Mode lokal: Supabase belum aktif."}
                  </p>
                </div>
              </Card.Body>
            </Card.Root>

            <div ref={outputRef}>
              <OutputChips
                id="hasil"
                isLoading={isLoadingWords}
                query={query}
                totalUnique={view.totalUnique}
                matched={view.matched}
                items={view.visible}
                onCopy={onCopy}
              />
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-5">
            <FilterCard
              value={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({ sortMode: "recent", minLen: null, maxLen: null, limit: 200 })
              }
            />

            <Card.Root className="rounded-3xl border-slate-200/70 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5">
              <Card.Header>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white/90">
                  Tambah Data
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
                  Import file dan tambah manual. Angka/marker seperti “141.” atau “.” otomatis dibuang.
                </p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-5">
                  <div>
                    <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
                      IMPORT
                    </p>
                    <div className="mt-2">
                      <Label.Root htmlFor="importFile" className="sr-only">
                        Pilih file
                      </Label.Root>
                      <input
                        id="importFile"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                        className="block w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-500/15 dark:border-white/10 dark:bg-black/20 dark:text-white/80 dark:file:bg-white/10 dark:hover:file:bg-white/15 dark:focus:ring-[#7DD3FC]/20"
                      />
                      {importStatus ? (
                        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                          {importStatus}
                        </p>
                      ) : null}
                      {importError ? (
                        <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                          {importError}
                        </p>
                      ) : null}
                    </div>
                    <Button.Root
                      className="mt-3 w-full"
                      onClick={onImport}
                      disabled={!importFile || isImporting}
                    >
                      {isImporting ? "Mengimpor…" : "Import"}
                    </Button.Root>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div>
                    <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
                      MANUAL
                    </p>
                    <form onSubmit={onSubmit} className="mt-2 space-y-3">
                      <div>
                        <Label.Root htmlFor="newWord" className="sr-only">
                          Kata atau kalimat baru
                        </Label.Root>
                        <Input.Root
                          id="newWord"
                          value={newWord}
                          onChange={(e) => setNewWord(e.target.value)}
                          placeholder="Tulis kata atau kalimat baru…"
                          autoComplete="off"
                        />
                        {manualError ? (
                          <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                            {manualError}
                          </p>
                        ) : null}
                      </div>
                      <Button.Root className="w-full">Simpan</Button.Root>
                    </form>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-white/60">
                        TERBARU
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/50">
                        {words.length} entri
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {words.slice(0, 8).map((w) => (
                        <button
                          key={w.toLocaleLowerCase()}
                          type="button"
                          onClick={() => onCopy(w)}
                          className="rounded-2xl border border-slate-200/70 bg-slate-950/[0.03] px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-sky-200 hover:bg-slate-950/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 dark:border-white/10 dark:bg-black/20 dark:text-white/80 dark:hover:border-[#7DD3FC]/35 dark:hover:bg-black/30 dark:focus-visible:ring-[#7DD3FC]/35"
                        >
                          <span className="block truncate font-mono">{w}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card.Root>
          </aside>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500 dark:text-white/45">
          {supabase
            ? "LIVE FEED ACTIVE"
            : "LOCAL MODE ACTIVE — set env Supabase untuk sinkron real-time"}
        </footer>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:border-white/10 dark:bg-black/40 dark:text-white/85 dark:shadow-[0_14px_40px_rgba(0,0,0,0.55)]">
          <span className="font-mono">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
