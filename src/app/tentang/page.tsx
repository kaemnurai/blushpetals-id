import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, Flower2, Sparkles } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Cerita di balik Blush Petals.id — florist premium yang merangkai kebahagiaan untuk setiap momenmu.",
};

export default function TentangPage() {
  return (
    <>
      <section className="container py-10 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-blush-600 text-xs uppercase tracking-widest mb-3">
            Tentang Kami
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-ink-900 text-balance">
            Merangkai kebahagiaan,
            <span className="text-blush-600"> satu bouquet</span> dalam satu waktu.
          </h1>
          <p className="text-ink-500 mt-5 text-balance">
            Blush Petals.id lahir dari cinta untuk bunga & detail. Kami percaya
            setiap bouquet harus terasa personal — seperti pelukan kecil yang
            disampaikan lewat kelopak.
          </p>
        </div>

        <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-card border border-blush-100/60">
            <Image
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&auto=format&fit=crop&q=80"
              alt="Tentang Blush Petals"
              fill
              sizes="(max-width: 768px) 90vw, 480px"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <h2 className="font-serif text-3xl text-ink-900">Cerita Kami</h2>
            <p className="text-sm text-ink-700 leading-relaxed">
              Berawal dari hobi merangkai bunga di rumah, kami melihat satu hal
              yang konsisten — senyum penerimanya. Senyum itulah yang membuat
              kami yakin: bunga bukan sekedar dekorasi, tapi cara untuk
              mengucapkan terima kasih, selamat, dan "aku bangga padamu".
            </p>
            <p className="text-sm text-ink-700 leading-relaxed">
              Kini, Blush Petals.id dipercaya untuk wisuda, anniversary, ulang
              tahun, hingga gift korporat. Setiap rangkaian kami buat dengan
              hati — soft, aesthetic, dan timeless.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <Feature icon={Flower2} title="Fresh Daily" />
              <Feature icon={Sparkles} title="Aesthetic" />
              <Feature icon={Heart} title="Heartfelt" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-blush-100 via-cream-100 to-blush-200 p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl md:text-4xl text-ink-900">
            Mari rangkai momen indahmu bersama kami.
          </h2>
          <Link
            href={quickEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink-900 text-white hover:brightness-110 transition text-sm"
          >
            Hubungi Kami
          </Link>
        </div>
      </section>
    </>
  );
}

function Feature({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-blush-100 p-3 text-center">
      <Icon className="h-4 w-4 text-blush-600 mx-auto" />
      <p className="text-xs text-ink-700 mt-2 font-medium">{title}</p>
    </div>
  );
}
