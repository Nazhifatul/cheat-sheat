"use client";

import * as React from "react";

import * as Button from "@/ui/button";
import * as Card from "@/ui/card";
import * as Input from "@/ui/input";
import * as Label from "@/ui/label";
import {
  filterWordsStartsWith,
  sanitizeEntry,
  uniqueWordsCaseInsensitive,
} from "@/utils/filterWords";
import {
  extractTextFromFile,
  splitEntriesFromText,
} from "@/utils/extractTextFromFile";
import { SAMPLE_WORDS } from "@/utils/sampleWords";
import { isSupabaseConfigured, supabase } from "@/utils/supabaseClient";

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
      const { data, error: fetchError } = await client
        .from("words")
        .select("word")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (isCancelled) return;

      if (fetchError) {
        setWords(uniqueWordsCaseInsensitive(SAMPLE_WORDS));
        setIsLoadingWords(false);
        setManualError(
          "Gagal memuat kamus online. Menampilkan data lokal sementara.",
        );
        return;
      }

      setWords(uniqueWordsCaseInsensitive((data ?? []).map((row) => row.word)));
      setIsLoadingWords(false);
      setManualError(null);
    }

    loadFromSupabase();

    if (!client) return;

    const channel = client
      .channel("words-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "words" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const w = (payload.new as { word?: unknown } | null)?.word;
            if (typeof w === "string") {
              setWords((prev) => uniqueWordsCaseInsensitive([w, ...prev]));
            }
            return;
          }

          if (payload.eventType === "DELETE") {
            const w = (payload.old as { word?: unknown } | null)?.word;
            if (typeof w === "string") {
              setWords((prev) =>
                prev.filter((x) => x.toLocaleLowerCase() !== w.toLocaleLowerCase()),
              );
            }
            return;
          }

          loadFromSupabase();
        },
      )
      .subscribe();

    return () => {
      isCancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const allWords = React.useMemo(() => {
    return uniqueWordsCaseInsensitive(words);
  }, [words]);

  const filtered = React.useMemo(() => {
    return filterWordsStartsWith(allWords, query);
  }, [allWords, query]);

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
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal membaca file.";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  }

  const isEmptyQuery = !query.trim();
  const showEmptyState = !filtered.length;

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="text-xs font-medium tracking-wide text-blue-700 dark:text-blue-300">
            Sambung Kata Helper
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
            Cheat Sheet Sambung Kata
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Ketik awalan huruf untuk mencari kata secara real-time. Kamu juga bisa
            tambah kata baru, dan semua perangkat akan langsung ikut update.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <Card.Root>
              <Card.Header>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                      Pencarian Real-time
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Hasil akan muncul saat kamu mengetik (startsWith, tidak
                      peka huruf besar/kecil).
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                    {filtered.length} hasil
                  </div>
                </div>
                <div className="mt-4">
                  <Label.Root htmlFor="search" className="sr-only">
                    Cari kata
                  </Label.Root>
                  <Input.Root
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Contoh: "A", "AN", "ANT"'
                    autoComplete="off"
                  />
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isEmptyQuery
                        ? "Ketik awalan untuk memfilter." 
                        : `Menampilkan hasil untuk: “${query.trim()}”`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total kata: {allWords.length}
                    </p>
                  </div>

                  <div className="max-h-[52vh] overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30">
                    {isLoadingWords ? (
                      <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
                        Memuat kamus…
                      </div>
                    ) : showEmptyState ? (
                      <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
                        Tidak ada hasil yang cocok.
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((word) => (
                          <li
                            key={word.toLocaleLowerCase()}
                            className="px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-slate-50 dark:text-slate-50 dark:hover:bg-white/5"
                          >
                            {word}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card.Root>
          </section>

          <section className="space-y-4">
            <Card.Root>
              <Card.Header>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Import Kata/Kalimat
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Upload file PDF, Word (.docx), atau Notepad (.txt). Duplikat akan diabaikan.
                </p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <div>
                    <Label.Root htmlFor="importFile" className="sr-only">
                      Pilih file
                    </Label.Root>
                    <input
                      id="importFile"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                      className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:file:bg-white/10 dark:file:text-slate-100 dark:hover:file:bg-white/15"
                    />
                    {importStatus ? (
                      <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                        {importStatus}
                      </p>
                    ) : null}
                    {importError ? (
                      <p className="mt-2 text-xs text-red-600">{importError}</p>
                    ) : null}
                  </div>
                  <Button.Root
                    className="w-full"
                    onClick={onImport}
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? "Mengimpor…" : "Import"}
                  </Button.Root>
                </div>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Tambah Manual
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Tambah satu kata/kalimat, langsung tersimpan ke Supabase.
                </p>
              </Card.Header>
              <Card.Body>
                <form onSubmit={onSubmit} className="space-y-3">
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
                      <p className="mt-2 text-xs text-red-600">{manualError}</p>
                    ) : null}
                  </div>
                  <Button.Root className="w-full">Simpan</Button.Root>
                </form>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Kata Terbaru
                  </h2>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                    {words.length} kata
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="max-h-[40vh] overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30">
                  {isLoadingWords ? (
                    <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
                      Memuat kata terbaru…
                    </div>
                  ) : words.length ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {words.slice(0, 50).map((word) => (
                        <li
                          key={word.toLocaleLowerCase()}
                          className="px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-slate-50 dark:text-slate-50 dark:hover:bg-white/5"
                        >
                          {word}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
                      Belum ada kata di kamus.
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card.Root>
          </section>
        </div>

        <footer className="mt-8 text-xs text-slate-500 dark:text-slate-400">
          {supabase ? "Tersimpan di Supabase dan tersinkron real-time." : "Mode lokal: Supabase belum aktif."}
        </footer>
      </div>
    </div>
  );
}
