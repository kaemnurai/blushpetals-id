import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ClipboardList, CreditCard, PackageCheck } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Cara Pemesanan",
  description: "Panduan lengkap cara order bouquet di Blush Petals.id.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Pilih Bouquet",
    desc: "Browsing katalog kami, pilih bouquet favoritmu. Bisa juga request custom!",
  },
  {
    icon: MessageCircle,
    title: "2. Klik Pesan Sekarang",
    desc: "Isi form pemesanan singkat — nama, nomor WA, tanggal, dan pilihan wrapping.",
  },
  {
    icon: CreditCard,
    title: "3. Konfirmasi via WhatsApp",
    desc: "Pesanan otomatis terkirim ke WA admin. Kami akan konfirmasi & info pembayaran.",
  },
  {
    icon: PackageCheck,
    title: "4. Ambil / Kirim",
    desc: "Pilih metode ambil ke store atau GoSend (untuk area sekitar). Bouquet siap!",
  },
];

const FAQ = [
  {
    q: "Berapa lama waktu pembuatan bouquet?",
    a: "Bouquet artificial bisa same day jika stock tersedia. Fresh flower mohon order minimal H-1 untuk hasil terbaik.",
  },
  {
    q: "Apakah bisa request bouquet custom?",
    a: "Tentu! Kami menerima request custom warna, jenis bunga, hingga ukuran. Chat WA untuk detail.",
  },
  {
    q: "Apakah ada free kartu ucapan?",
    a: "Semua bouquet diatas Rp75.000 free kartu ucapan handwritten dari kami.",
  },
  {
    q: "Apakah bisa kirim ke luar kota?",
    a: "Saat ini layanan pengiriman fokus area kota. Untuk luar kota dapat dikirim via ekspedisi (artificial).",
  },
];

export default function CaraPemesananPage() {
  return (
    <>
      <section className="container py-10 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-blush-600 text-xs uppercase tracking-widest mb-3">
            Panduan Order
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink-900 text-balance">
            Cara Pemesanan
          </h1>
          <p className="text-ink-500 mt-4">
            Order bouquet semudah 4 langkah. Cepat, ramah, dan personal.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="rounded-3xl bg-white border border-blush-100/60 p-6 shadow-card hover:shadow-soft transition relative"
              >
                <div className="absolute -top-3 left-6 h-7 px-3 rounded-full bg-blush-500 text-white text-[10px] font-medium uppercase tracking-wider flex items-center">
                  Step {i + 1}
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blush-100 to-cream-100 flex items-center justify-center text-blush-600 mb-4 mt-2">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg text-ink-900">{s.title}</h3>
                <p className="text-xs text-ink-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl text-ink-900 text-center mb-8">
            Pertanyaan yang Sering Ditanya
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-white border border-blush-100 px-5 py-4 shadow-card open:shadow-soft"
              >
                <summary className="cursor-pointer list-none font-medium text-ink-900 text-sm flex items-center justify-between">
                  {item.q}
                  <span className="text-blush-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 pb-16">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-blush-500 to-blush-600 p-8 md:p-12 text-center text-white">
          <h2 className="font-serif text-2xl md:text-3xl">Siap order sekarang?</h2>
          <p className="opacity-90 mt-2 text-sm">Klik tombol di bawah, kami balas dengan ramah ♡</p>
          <Link
            href={quickEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-blush-700 hover:brightness-105 transition text-sm font-medium"
          >
            Chat WhatsApp
          </Link>
        </div>
      </section>
    </>
  );
}
