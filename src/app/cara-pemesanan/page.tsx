import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ClipboardList, CreditCard, PackageCheck, ArrowRight, ChevronDown } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Cara Pemesanan",
  description: "Panduan lengkap cara order bouquet di Blush Petals.id.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "Pilih Bouquet",
    desc: "Browsing katalog kami, pilih bouquet favoritmu. Bisa juga request custom sesuai keinginan!",
    color: "from-blush-50 to-cream-100",
    iconColor: "text-blush-500",
  },
  {
    icon: MessageCircle,
    title: "Klik Pesan Sekarang",
    desc: "Isi form pemesanan singkat — nama, nomor WA, tanggal, dan pilihan wrapping.",
    color: "from-blush-100 to-blush-50",
    iconColor: "text-blush-600",
  },
  {
    icon: CreditCard,
    title: "Konfirmasi via WhatsApp",
    desc: "Pesanan otomatis terkirim ke WA admin. Kami akan konfirmasi & info pembayaran.",
    color: "from-cream-100 to-blush-50",
    iconColor: "text-blush-500",
  },
  {
    icon: PackageCheck,
    title: "Ambil / Kirim",
    desc: "Pilih metode ambil ke store atau GoSend (untuk area sekitar). Bouquet siap!",
    color: "from-blush-50 to-cream-50",
    iconColor: "text-blush-600",
  },
];

const FAQ = [
  {
    q: "Berapa lama waktu pembuatan bouquet?",
    a: "Bouquet artificial bisa same day jika stock tersedia. Fresh flower mohon order minimal H-1 untuk hasil terbaik.",
  },
  {
    q: "Apakah bisa request bouquet custom?",
    a: "Tentu! Kami menerima request custom warna, jenis bunga, hingga ukuran. Chat WA untuk detail dan konsultasi gratis.",
  },
  {
    q: "Apakah ada free kartu ucapan?",
    a: "Semua bouquet di atas Rp75.000 free kartu ucapan handwritten dari kami — ditulis dengan penuh kasih sayang.",
  },
  {
    q: "Apakah bisa kirim ke luar kota?",
    a: "Saat ini layanan pengiriman fokus area kota. Untuk luar kota dapat dikirim via ekspedisi (artificial bouquet).",
  },
];

export default function CaraPemesananPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blush-gradient -z-10" />
        <div className="absolute inset-0 bg-petal-gradient -z-10 opacity-70" />
        <div className="container py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label mb-4">Panduan Order</p>
            <h1 className="page-title text-balance">
              Cara <span className="italic text-blush-600">Pemesanan</span>
            </h1>
            <p className="text-ink-500 mt-5 text-[15px] leading-relaxed max-w-sm mx-auto">
              Order bouquet semudah 4 langkah. Cepat, ramah, dan personal.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-4 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-[2.8rem] left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-gradient-to-r from-transparent via-blush-200 to-transparent z-0 pointer-events-none" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative rounded-3xl bg-white border border-blush-100/60 p-6 shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 z-10"
              >
                {/* Step number badge */}
                <div className="absolute -top-3.5 left-6 h-7 px-3 rounded-full bg-gradient-to-br from-blush-500 to-blush-600 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center shadow-soft">
                  Step {i + 1}
                </div>

                {/* Icon */}
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.color} border border-blush-100/50 flex items-center justify-center ${s.iconColor} mb-4 mt-2`}>
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="font-serif text-[17px] text-ink-900 mb-2">{s.title}</h3>
                <p className="text-[12px] md:text-xs text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4">FAQ</p>
            <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-blush-300 to-transparent mx-auto mb-5" />
            <h2 className="section-title">
              Pertanyaan yang{" "}
              <span className="italic text-blush-600">Sering Ditanya</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-white border border-blush-100/70 shadow-card overflow-hidden open:shadow-elevated transition-shadow duration-200"
              >
                <summary className="cursor-pointer px-5 py-4 font-medium text-ink-900 text-sm flex items-center justify-between gap-4 hover:bg-blush-50/50 transition-colors duration-150">
                  <span>{item.q}</span>
                  <ChevronDown className="h-4 w-4 text-blush-500 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 pt-0">
                  <div className="h-px bg-gradient-to-r from-blush-100 via-blush-200 to-blush-100 mb-3" />
                  <p className="text-sm text-ink-600 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-10 pb-16 md:pb-24">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blush-500 via-blush-600 to-blush-700" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />

          <div className="relative z-10 text-white">
            <p className="text-blush-100 text-xs uppercase tracking-[0.2em] mb-3">Mulai Sekarang</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-tight">
              Siap order{" "}
              <span className="italic">sekarang?</span>
            </h2>
            <p className="text-blush-100 mt-2 text-sm">Klik tombol di bawah, kami balas dengan ramah ♡</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={quickEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-blush-700 hover:bg-blush-50 transition-colors duration-200 text-sm font-semibold shadow-soft"
              >
                Chat WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors duration-200 text-sm font-medium backdrop-blur-sm"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
