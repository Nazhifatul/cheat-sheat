import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sambung Kata — Generator Kata Lanjutan",
  description:
    "Cari kata cepat dengan search real-time, import dari file, dan sinkron otomatis lewat Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
