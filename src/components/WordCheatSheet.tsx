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
  const [suffixQuery, setSuffixQuery] = React.useState("");
  const [newWord, setNewWord] = React.useState("");
  const [words, setWords] = React.useState<string[]>([]);
  const [isLoadingWords, setIsLoadingWords] = React.useState(true);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [deleteQuery, setDeleteQuery] = React.useState("");
  const [selectedDeletes, setSelectedDeletes] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteStatus, setDeleteStatus] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [manualError, setManualError] = React.useState<string | null>(null);
  const [sortMode, setSortMode] = React.useState<"az" | "za">("az");
  const [toast, setToast] = React.useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = React.useState<Date | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      suffixQuery,
      sortMode,
      minLen: null,
      maxLen: null,
      limit: 200,
    });
  }, [query, sortMode, suffixQuery, words]);

  const deleteCandidates = React.useMemo(() => {
    const q = deleteQuery.trim().toLocaleLowerCase();
    const source = q
      ? words.filter((word) => word.toLocaleLowerCase().includes(q))
      : words;
    return source.slice(0, 18);
  }, [deleteQuery, words]);

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

  function toggleDeleteWord(word: string) {
    setDeleteStatus(null);
    setDeleteError(null);
    setSelectedDeletes((prev) =>
      prev.includes(word) ? prev.filter((item) => item !== word) : [...prev, word],
    );
  }

  async function onDeleteSelected() {
    if (!selectedDeletes.length) {
      setDeleteError("Pilih dulu kata/kalimat yang ingin dihapus.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    setDeleteStatus(null);

    try {
      const client = supabase;

      if (!client) {
        setWords((prev) => prev.filter((word) => !selectedDeletes.includes(word)));
        setDeleteStatus(
          `${selectedDeletes.length} entri dihapus dari data lokal.`,
        );
        setSelectedDeletes([]);
        return;
      }

      const { error } = await client
        .from("words")
        .delete()
        .in("word", selectedDeletes);

      if (error) {
        setDeleteError(`Gagal menghapus data. ${error.message}`);
        return;
      }

      setWords((prev) => prev.filter((word) => !selectedDeletes.includes(word)));
      setDeleteStatus(
        `${selectedDeletes.length} entri berhasil dihapus dari database.`,
      );
      setSelectedDeletes([]);
      setLastSyncAt(new Date());
    } finally {
      setIsDeleting(false);
    }
  }

  React.useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function onCopy(value: string) {
    try {
      await copyText(value);
      setToast(`Disalin: ${value}`);
    } catch {
      setToast("Gagal menyalin.");
    }
  }

  function clearSearch() {
    setQuery("");
    setSuffixQuery("");
    inputRef.current?.focus();
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
  const patternPreview =
    query.trim() || suffixQuery.trim()
      ? `${query.trim() || "…"} • ${suffixQuery.trim() || "…"}`
      : "semua kata";

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.1),transparent_28%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_55%,#f3f7f6_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:min-h-screen lg:px-8 lg:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-slate-500">
              CHEATWORDS
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Cari kata tanpa ribet
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Ketik awalan atau akhiran, hasil langsung muncul di samping.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/10 bg-white/85 px-4 py-3 text-right shadow-sm">
            <p className="font-mono text-[10px] tracking-[0.24em] text-slate-500">
              POLA
            </p>
            <p className="mt-1 font-mono text-sm text-slate-950">{patternPreview}</p>
          </div>
        </div>

        <StatusBadgesRow
          className="mt-4"
          badges={[
            modeBadge,
            { label: "TOTAL", value: String(view.totalUnique), tone: "neutral" },
            { label: "HASIL", value: String(view.matched), tone: "info" },
            { label: "SYNC", value: lastSyncLabel, tone: "neutral" },
          ]}
        />

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Card.Root className="rounded-[1.5rem] border-slate-900/10 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur lg:col-start-1 lg:row-start-1">
            <Card.Header>
              <p className="font-mono text-[10px] tracking-[0.28em] text-slate-500">
                INPUT CEPAT
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Langsung ketik
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Tidak perlu klik tombol lihat hasil. Area hasil akan selalu terlihat.
              </p>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <Label.Root htmlFor="search" className="text-sm font-medium text-slate-700">
                    Awalan kata
                  </Label.Root>
                  <Input.Root
                    ref={inputRef}
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="mis. me, anti, pro"
                    autoComplete="off"
                    className="mt-2 h-12 rounded-[1rem] border-slate-900/10 bg-white text-base"
                  />
                </div>

                <div>
                  <Label.Root htmlFor="suffix" className="text-sm font-medium text-slate-700">
                    Kata akhir
                  </Label.Root>
                  <Input.Root
                    id="suffix"
                    value={suffixQuery}
                    onChange={(e) => setSuffixQuery(e.target.value)}
                    placeholder="opsional, mis. kan, an, i"
                    autoComplete="off"
                    className="mt-2 h-12 rounded-[1rem] border-slate-900/10 bg-white text-base"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Urutkan hasil</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button.Root
                      className={
                        sortMode === "az"
                          ? "bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-800"
                          : ""
                      }
                      variant="neutral"
                      mode={sortMode === "az" ? "filled" : "stroke"}
                      onClick={() => setSortMode("az")}
                    >
                      A-Z
                    </Button.Root>
                    <Button.Root
                      className={
                        sortMode === "za"
                          ? "bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-800"
                          : ""
                      }
                      variant="neutral"
                      mode={sortMode === "za" ? "filled" : "stroke"}
                      onClick={() => setSortMode("za")}
                    >
                      Z-A
                    </Button.Root>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button.Root
                    className="flex-1 bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#dc2626]"
                    onClick={clearSearch}
                  >
                    Bersihkan
                  </Button.Root>
                  <Button.Root
                    className="flex-1 bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-800"
                    onClick={() => inputRef.current?.focus()}
                  >
                    Fokus
                  </Button.Root>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          <section className="min-h-[50vh] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0">
            <OutputChips
              id="hasil"
              className="h-full"
              isLoading={isLoadingWords}
              query={query}
              suffixQuery={suffixQuery}
              items={view.visible}
              onCopy={onCopy}
            />
          </section>

          <Card.Root className="rounded-[1.5rem] border-slate-900/10 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur lg:col-start-1 lg:row-start-2">
            <Card.Header>
              <p className="font-mono text-[10px] tracking-[0.28em] text-slate-500">
                DATA
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Import dan tambah
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Fitur tambahan tetap ada, tapi tidak mengganggu area pencarian utama.
              </p>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                <div>
                  <Label.Root
                    htmlFor="deleteWord"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hapus kata/kalimat
                  </Label.Root>
                  <Input.Root
                    id="deleteWord"
                    value={deleteQuery}
                    onChange={(e) => setDeleteQuery(e.target.value)}
                    placeholder="Cari kata atau kalimat yang mau dihapus…"
                    autoComplete="off"
                    className="mt-2 border-slate-300 bg-white"
                  />
                  <div className="mt-3 max-h-48 overflow-auto rounded-2xl border border-slate-900/10 bg-slate-50/70 p-2">
                    <div className="grid gap-2">
                      {deleteCandidates.length ? (
                        deleteCandidates.map((word) => {
                          const active = selectedDeletes.includes(word);
                          return (
                            <button
                              key={word.toLocaleLowerCase()}
                              type="button"
                              onClick={() => toggleDeleteWord(word)}
                              className={
                                active
                                  ? "rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-left text-sm text-rose-900"
                                  : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                              }
                            >
                              <span className="block break-words font-mono">
                                {word}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-2 py-3 text-sm text-slate-500">
                          Tidak ada hasil untuk pencarian ini.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button.Root
                      className="flex-1 bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#dc2626]"
                      onClick={onDeleteSelected}
                      disabled={!selectedDeletes.length || isDeleting}
                    >
                      {isDeleting
                        ? "Menghapus…"
                        : `Hapus ${selectedDeletes.length || ""}`.trim()}
                    </Button.Root>
                    <Button.Root
                      variant="neutral"
                      mode="stroke"
                      className="flex-1"
                      onClick={() => {
                        setDeleteQuery("");
                        setSelectedDeletes([]);
                        setDeleteError(null);
                        setDeleteStatus(null);
                      }}
                    >
                      Clear pilihan
                    </Button.Root>
                  </div>
                  {deleteStatus ? (
                    <p className="mt-2 text-xs text-emerald-700">{deleteStatus}</p>
                  ) : null}
                  {deleteError ? (
                    <p className="mt-2 text-xs text-rose-700">{deleteError}</p>
                  ) : null}
                </div>

                <div className="h-px w-full bg-slate-200" />

                <div>
                  <Label.Root htmlFor="importFile" className="text-sm font-medium text-slate-700">
                    Import file
                  </Label.Root>
                  <input
                    id="importFile"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full rounded-2xl border border-slate-900/10 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-[#0f766e]/15"
                  />
                  {importStatus ? (
                    <p className="mt-2 text-xs text-emerald-700">{importStatus}</p>
                  ) : null}
                  {importError ? (
                    <p className="mt-2 text-xs text-rose-700">{importError}</p>
                  ) : null}
                  <Button.Root
                    className="mt-3 w-full bg-[#0f766e] text-white hover:bg-[#115e59] active:bg-[#115e59]"
                    onClick={onImport}
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? "Mengimpor…" : "Import"}
                  </Button.Root>
                </div>

                <div className="h-px w-full bg-slate-200" />

                <form onSubmit={onSubmit} className="space-y-3">
                  <div>
                    <Label.Root htmlFor="newWord" className="text-sm font-medium text-slate-700">
                      Tambah kata
                    </Label.Root>
                    <Input.Root
                      id="newWord"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Tulis kata atau kalimat baru…"
                      autoComplete="off"
                      className="mt-2 border-slate-300 bg-white"
                    />
                    {manualError ? (
                      <p className="mt-2 text-xs text-rose-700">{manualError}</p>
                    ) : null}
                  </div>
                  <Button.Root className="w-full bg-[#f97316] text-slate-950 hover:bg-[#ea580c] active:bg-[#ea580c]">
                    Simpan
                  </Button.Root>
                </form>

                <div className="h-px w-full bg-slate-200" />

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] tracking-[0.24em] text-slate-500">
                      TERBARU
                    </p>
                    <p className="text-xs text-slate-500">{words.length} entri</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {words.slice(0, 8).map((w) => (
                      <button
                        key={w.toLocaleLowerCase()}
                        type="button"
                        onClick={() => onCopy(w)}
                        className="rounded-2xl border border-slate-900/10 bg-slate-50/80 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-[#0f766e]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/30"
                      >
                        <span className="block truncate font-mono">{w}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        </div>

        <footer className="mt-4 text-center text-xs text-slate-500">
          {supabase
            ? "LIVE FEED ACTIVE"
            : "LOCAL MODE ACTIVE — set env Supabase untuk sinkron real-time"}
        </footer>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-900/10 bg-white/92 px-4 py-3 text-sm text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur">
          <span className="font-mono">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
