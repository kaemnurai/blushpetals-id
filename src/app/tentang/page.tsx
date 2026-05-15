import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Flower2, Sparkles, ArrowRight, MapPin, MessageCircle, Instagram } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Cerita di balik Blush Petals.id — florist premium yang merangkai kebahagiaan untuk setiap momenmu.",
};

export default function TentangPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blush-gradient -z-10" />
        <div className="absolute inset-0 bg-petal-gradient -z-10 opacity-70" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blush-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="container py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label mb-4">Tentang Kami</p>
            <h1 className="page-title text-balance">
              Merangkai kebahagiaan,{" "}
              <span className="italic text-blush-600">satu bouquet</span>{" "}
              dalam satu waktu.
            </h1>
            <p className="text-ink-500 mt-5 text-[15px] md:text-base leading-relaxed text-balance max-w-lg mx-auto">
              Blush Petals.id lahir dari cinta untuk bunga & detail. Kami percaya
              setiap bouquet harus terasa personal — seperti pelukan kecil yang
              disampaikan lewat kelopak.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blush-100/60 to-cream-200/60 rounded-[3rem] blur-2xl pointer-events-none" />
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-premium border border-white/60">
              <ImageWithFallback
                src="https://vdvxlkrarllcoixcxxwd.supabase.co/storage/v1/object/public/products/1778766760588-43s6u-signature-jumbo-bloom.jpeg"
                alt="Signature Jumbo Bloom — Blush Petals.id"
                fill
                sizes="(max-width: 768px) 90vw, 480px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/10 via-transparent to-white/5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-5">
            <p className="section-label mb-4">Cerita Kami</p>
            <h2 className="section-title">
              Dimulai dari cinta
              <br />
              untuk setiap{" "}
              <span className="italic text-blush-600">detail.</span>
            </h2>
            <p className="text-[14px] md:text-sm text-ink-700 leading-relaxed">
              Berawal dari hobi merangkai bunga di rumah, kami melihat satu hal
              yang konsisten — senyum penerimanya. Senyum itulah yang membuat
              kami yakin: bunga bukan sekedar dekorasi, tapi cara untuk
              mengucapkan terima kasih, selamat, dan "aku bangga padamu".
            </p>
            <p className="text-[14px] md:text-sm text-ink-700 leading-relaxed">
              Kini, Blush Petals.id dipercaya untuk wisuda, anniversary, ulang
              tahun, hingga gift korporat. Setiap rangkaian kami buat dengan
              hati — soft, aesthetic, dan timeless.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <FeatureCard icon={Flower2} title="Fresh Daily" desc="Stok bunga segar setiap hari" />
              <FeatureCard icon={Sparkles} title="Aesthetic" desc="Desain modern & elegan" />
              <FeatureCard icon={Heart} title="Heartfelt" desc="Dibuat dengan sepenuh hati" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <p className="section-label mb-4">Nilai Kami</p>
          <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-blush-300 to-transparent mx-auto mb-5" />
          <h2 className="section-title">
            Yang membuat kami{" "}
            <span className="italic text-blush-600">berbeda</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="rounded-3xl bg-white border border-blush-100/60 p-6 md:p-7 shadow-card hover:shadow-premium transition-shadow duration-300"
            >
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="font-serif text-lg text-ink-900 mb-2">{v.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kontak */}
      <section className="container py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <p className="section-label mb-4">Kontak Kami</p>
          <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-blush-300 to-transparent mx-auto mb-5" />
          <h2 className="section-title">
            Hubungi{" "}
            <span className="italic text-blush-600">Blush Petals.id</span>
          </h2>
          <p className="text-sm text-ink-500 mt-3 max-w-md mx-auto leading-relaxed">
            Kami siap membantu bouquet spesial untuk momen terbaikmu 🌸
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto items-start">
          {/* Contact cards */}
          <div className="space-y-4">
            <a
              href="https://instagram.com/blushpetals.id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-blush-100/60 shadow-card hover:shadow-premium transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-100 to-blush-100 flex items-center justify-center text-blush-500 shrink-0">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-0.5">Instagram</p>
                <p className="text-sm font-semibold text-ink-900 group-hover:text-blush-600 transition-colors">
                  @blushpetals.id
                </p>
              </div>
            </a>

            <a
              href={quickEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-blush-100/60 shadow-card hover:shadow-premium transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-0.5">WhatsApp</p>
                <p className="text-sm font-semibold text-ink-900 group-hover:text-emerald-600 transition-colors">
                  081322118378
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 rounded-3xl bg-white border border-blush-100/60 shadow-card">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blush-50 to-cream-100 flex items-center justify-center text-blush-500 shrink-0 mt-0.5">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-0.5">Alamat</p>
                <p className="text-sm font-semibold text-ink-900 leading-snug">
                  Sharia Green Valley 2, Ona, Rangkasbitung
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden border border-blush-100/60 shadow-card">
            <div className="relative h-64 md:h-72 w-full">
              <iframe
                src="https://maps.google.com/maps?q=Sharia+Green+Valley+2+Ona+Rangkasbitung&output=embed&hl=id"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                title="Lokasi Blush Petals.id"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://share.google/JlY8rQc8GIfTUxhwQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blush-50 to-cream-50 hover:from-blush-100 hover:to-cream-100 transition-colors border-t border-blush-100/60 text-sm font-medium text-blush-600 hover:text-blush-700"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              Buka Lokasi di Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-10 pb-16 md:pb-24">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-200" />
          <div className="absolute inset-0 bg-petal-gradient opacity-60" />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-5xl text-ink-900 max-w-lg mx-auto leading-[1.1] tracking-tight text-balance">
              Mari rangkai momen indahmu{" "}
              <span className="italic text-blush-600">bersama kami.</span>
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={quickEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Hubungi Kami
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/katalog" className="btn-secondary">
                Lihat Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const VALUES = [
  {
    icon: "🌸",
    title: "Kualitas Premium",
    desc: "Kami hanya menggunakan bunga & bahan berkualitas terbaik. Setiap bouquet diperiksa sebelum dikirim.",
  },
  {
    icon: "💌",
    title: "Personal Touch",
    desc: "Setiap pesanan ditangani secara personal. Kami memastikan bouquet kamu benar-benar terasa special.",
  },
  {
    icon: "⚡",
    title: "Fast & Reliable",
    desc: "Same day service untuk artificial bouquet. Konfirmasi cepat via WhatsApp. Pengiriman tepat waktu.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-blush-100/80 p-3.5 text-center shadow-card">
      <div className="h-9 w-9 mx-auto rounded-xl bg-gradient-to-br from-blush-50 to-cream-100 flex items-center justify-center text-blush-500 mb-2">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-ink-700 font-medium leading-tight">{title}</p>
      <p className="text-[10px] text-ink-400 mt-1 leading-relaxed hidden md:block">{desc}</p>
    </div>
  );
}
