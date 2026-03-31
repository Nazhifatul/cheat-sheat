# Page Design Spec — Redesign Landing Page “Sambung Kata” (Desktop-first)

Dokumen ini mendeskripsikan layout dan UI landing page dengan struktur modul mengikuti referensi, namun gaya visual berbeda (lebih editorial + glassmorphism halus, bukan “neon sci‑fi”).

## 1) Layout
- **Sistem layout**: Hybrid CSS Grid + Flex.
  - Grid utama: 12 kolom, max-width 1200–1280px, center aligned.
  - Spacing: 8px base unit (8/16/24/32/48).
- **Struktur area** (desktop):
  - Baris 1: Header/Hero (full width container).
  - Baris 2: Status badges (inline row; wrap bila sempit).
  - Baris 3: Input + Filter (2 kolom: kiri input besar, kanan filter card).
  - Baris 4: Panel output chips (full width card; di dalamnya chip grid).
- **Responsiveness (ringkas)**:
  - ≥1024px: 2 kolom pada area input+filter.
  - <1024px: menjadi stack vertikal (Input di atas Filter), Output tetap di bawah.

## 2) Meta Information
- **Title**: Sambung Kata — Generator Kata Lanjutan
- **Description**: Buat rangkaian kata lanjutan dengan cepat dari kata awal, gunakan filter untuk mengatur hasil, lalu salin dalam sekali klik.
- **Open Graph**:
  - og:title = Sambung Kata
  - og:description = Generator kata lanjutan dengan output berupa chips.
  - og:type = website

## 3) Global Styles (Design Tokens)
- **Tema**: “Warm Dark Editorial” (gelap hangat, aksen kontras lembut).
- **Colors**:
  - Background: #0B0F14 (ink)
  - Surface/Card: rgba(255,255,255,0.06) dengan blur (glass halus)
  - Border: rgba(255,255,255,0.10)
  - Text primary: rgba(255,255,255,0.92)
  - Text secondary: rgba(255,255,255,0.68)
  - Accent 1 (CTA): #FFB86B (apricot)
  - Accent 2 (info): #7DD3FC (soft cyan)
  - Danger: #FB7185
  - Success: #34D399
- **Typography**:
  - H1: 40–48px / 1.1, semi-bold
  - H2: 24–28px / 1.2
  - Body: 14–16px / 1.6
  - Mono (opsional untuk output count/status): 12–13px
- **Buttons**:
  - Primary: background Accent 1, text #1A1A1A, hover gelap 8%, disabled opacity 40%.
  - Secondary: surface + border, hover border lebih tegas.
- **Inputs**:
  - Tinggi 44–48px, radius 12px.
  - Focus ring: 2px Accent 2 dengan glow tipis (tanpa neon).
- **Links**: underline on hover, warna Accent 2.
- **Radius & Shadow**:
  - Radius: 16px card, 12px input/button, 999px untuk badges.
  - Shadow: soft shadow 0 10px 30px rgba(0,0,0,0.35).
- **Motion**:
  - Transisi 160–220ms ease-out (hover, focus, chip select).

## 4) Page Structure (Komposisi)
Pola: **stacked sections** di dalam container terpusat, dengan kartu (cards) sebagai pengelompokan komponen. Aksen visual utama adalah gradient halus pada header dan glassmorphism ringan pada cards.

## 5) Sections & Components

### 5.1 Header Futuristik (gaya baru)
**Tujuan**: memberi kesan modern dan “smart tool”, tanpa neon/sci‑fi berat.
- **Background header**:
  - Gradient radial halus (mis. ink → deep blue → ink) + noise texture tipis.
  - 1 elemen dekoratif: “orb/halo” blur besar di pojok kanan atas (opacity rendah).
- **Konten** (kiri):
  - H1: “Sambung Kata”
  - Subjudul 1 kalimat (value prop).
  - CTA utama: “Mulai” / “Proses” (mengarah ke area input, scroll/focus).
- **Konten tambahan** (kanan, opsional tapi tetap satu layar):
  - Mini card “Cara cepat” berisi 2–3 bullet pendek (mis. Ketik kata → Atur filter → Salin chips).

### 5.2 Status Badges Row
**Tujuan**: informasi ringkas seperti “Mode”, “Jumlah hasil”, “Valid/Invalid”, “Terakhir diproses”.
- Badges berbentuk pill (radius 999), tinggi 28–32px.
- Tipe badges:
  - Neutral: surface + border.
  - Success: tinted success background tipis.
  - Danger: tinted danger background tipis.
  - Info: tinted Accent 2 tipis.
- Perilaku:
  - Wrap otomatis ketika lebar mengecil.
  - Badge “Jumlah hasil” berubah setelah proses selesai.

### 5.3 Area Input (kolom kiri)
**Tujuan**: titik fokus utama.
- **Card Input** berisi:
  1. Label: “Kata/Frasa Awal” + helper text singkat.
  2. Text input besar (single line) dengan placeholder.
  3. Tombol utama “Proses” di kanan input (inline) atau di bawah (jika sempit).
  4. Indikator loading saat proses berjalan (spinner kecil di tombol + teks “Memproses…”).
- **Validasi**:
  - Error inline (warna danger) bila kosong/tidak valid.
  - Disable tombol jika input kosong atau sedang memproses.

### 5.4 Area Filter (kolom kanan)
**Tujuan**: kontrol parameter tanpa mengganggu input.
- **Filter Card** dengan judul “Filter”.
- Kontrol minimal (mengikuti kebutuhan produk, tanpa menambah fitur baru):
  - “Panjang kata” (mis. dropdown/segmented atau slider sederhana).
  - “Batas hasil” (dropdown angka).
  - “Tema/Kategori” (dropdown) bila memang tersedia di produk.
  - Tombol “Reset” (secondary) untuk kembali default.
- Pola UI:
  - Gunakan komponen form ringkas; jarak antar kontrol 12–16px.

### 5.5 Panel Output Chips (full width)
**Tujuan**: menampilkan hasil sebagai chips yang bisa diaksi cepat.
- **Output Card** berisi:
  - Header bar: judul “Hasil” + count + (opsional) aksi global “Salin semua” bila memang sudah ada; jika tidak ada, jangan tampilkan.
  - Body: grid chips (auto-fill) dengan gap 8–10px.
- **Chip UI**:
  - Default: surface + border, teks primary.
  - Hover: border lebih terang, background naik sedikit.
  - Selected/Pin: accent outline (Accent 2) + ikon kecil.
- **Aksi per chip** (sesuai PRD):
  - Klik chip: pilih/sematkan.
  - Tombol kecil “Copy” di dalam chip atau muncul saat hover (desktop).
- **States**:
  - Empty state: teks “Belum ada hasil—isi input lalu klik Proses”.
  - No result: teks + saran singkat (ubah input/filter).
  - Error state: pesan error + CTA kembali ke input.

### 5.6 Notifikasi & Error Messaging
- Toast kecil di kanan bawah untuk aksi “Berhasil disalin”.
- Error besar ditampilkan inline di output card (bukan modal), agar alur tetap cepat.

## 6) Interaction Notes (ringkas)
- Enter pada input menjalankan “Proses”.
- Setelah proses sukses, fokus visual bergeser ke Output (scroll halus 200–300ms jika output di bawah fold).
- Pilih chip menambah state “selected” yang konsisten sampai proses ulang.
