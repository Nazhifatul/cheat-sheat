# Spesifikasi Desain Halaman — Cheat Sheet Sambung Kata (Desktop-first)

## Global Styles
- Background: putih / abu sangat muda (#F8FAFC)
- Surface (card): putih (#FFFFFF) dengan border tipis (#E2E8F0)
- Typography: sans-serif modern (mis. Inter/system), skala 14/16/20/28
- Primary color: biru (#2563EB)
- Text: utama (#0F172A), sekunder (#475569)
- Button states:
  - Default: solid primary, text putih
  - Hover: gelapkan ~8%
  - Disabled: opacity 50%, cursor not-allowed
- Input states:
  - Default: border netral
  - Focus: outline/ring primary

## Page: Beranda (Cheat Sheet)

### Layout
- Struktur utama: container terpusat (max-width ~960px) dengan padding 24px.
- Sistem layout: kombinasi Flexbox (header & form) + stacked sections.
- Desktop-first: 2 kolom pada area konten (kiri: pencarian+hasil, kanan: kata tersimpan). Pada layar kecil, kolom menjadi 1 (stack).

### Meta Information
- Title: "Cheat Sheet Sambung Kata"
- Description: "Cari kata cepat dengan search real-time dan simpan kata favorit di browser."
- Open Graph:
  - og:title sama dengan title
  - og:description sama dengan description

### Page Structure
1. Header
2. Area Pencarian & Hasil (kolom kiri)
3. Area Kata Tersimpan (kolom kanan)
4. Footer kecil (teks informatif singkat)

### Sections & Components

#### 1) Header
- Elemen:
  - H1 judul aplikasi
  - Paragraf deskripsi singkat (1 baris)
- Perilaku:
  - Tetap ringkas; tidak perlu sticky.

#### 2) Pencarian real-time (kolom kiri)
- Komponen:
  - Text input (placeholder: “Ketik kata…”) ukuran besar
  - Teks bantuan kecil: “Hasil akan muncul saat kamu mengetik.”
- Interaksi:
  - OnChange langsung memfilter data.
  - Tampilkan state:
    - Empty query: tampilkan list default (atau instruksi singkat di area hasil)
    - No result: tampilkan pesan “Tidak ada hasil yang cocok”.

#### 3) List hasil (kolom kiri)
- Komponen:
  - Bar informasi: “X hasil”
  - List vertikal (item berupa teks kata/frasanya)
- Visual:
  - Item memakai row dengan padding 12px; hover background netral untuk keterbacaan.

#### 4) Tambah kata (kolom kanan, bagian atas)
- Komponen:
  - Input kata baru
  - Tombol “Simpan”
  - Pesan validasi inline bila input kosong
- Interaksi:
  - Setelah simpan sukses: input dikosongkan dan daftar kata tersimpan diperbarui.

#### 5) Daftar kata tersimpan (kolom kanan, bagian bawah)
- Komponen:
  - Judul section: “Kata tersimpan”
  - List vertikal dari data localStorage
  - Empty state: “Belum ada kata tersimpan.”
- Perilaku:
  - Saat page load: load dari localStorage dan render.
  - Saat tambah kata: update UI + localStorage.

#### 6) Footer
- Teks kecil: “Tersimpan lokal di browser kamu (localStorage).”
