export type SupportedImportFileKind = "txt" | "pdf" | "docx";

function getFileKind(file: File): SupportedImportFileKind | null {
  const name = file.name.toLocaleLowerCase();
  if (name.endsWith(".txt")) return "txt";
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return null;
}

export function splitEntriesFromText(rawText: string) {
  const normalized = rawText.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const lines = normalized.split("\n");
  const entries: string[] = [];

  for (const line of lines) {
    const parts = line.split(/[;,|]/g);
    for (const p of parts) {
      const value = p.trim().replace(/^"|"$/g, "");
      if (!value) continue;
      entries.push(value);
    }
  }

  return entries;
}

async function extractTextFromTxt(file: File) {
  return await file.text();
}

async function extractTextFromDocx(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value ?? "";
}

async function extractTextFromPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import("pdfjs-dist/webpack.mjs");

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const textParts: string[] = [];
    for (const it of content.items) {
      const s = "str" in it ? String(it.str) : "";
      if (s) textParts.push(s);
      if ("hasEOL" in it && Boolean((it as { hasEOL?: unknown }).hasEOL)) {
        textParts.push("\n");
      }
    }
    const text = textParts.join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

export async function extractTextFromFile(file: File) {
  const kind = getFileKind(file);
  if (!kind) {
    throw new Error("Format file belum didukung. Gunakan PDF, DOCX, atau TXT.");
  }

  if (kind === "txt") return await extractTextFromTxt(file);
  if (kind === "docx") return await extractTextFromDocx(file);
  return await extractTextFromPdf(file);
}
