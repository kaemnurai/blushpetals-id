"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/data/site";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80";
const FALLBACK_IMAGE_SM =
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80";

export function Hero({ heroProduct }: { heroProduct?: Product }) {
  const heroImage   = heroProduct?.image || FALLBACK_IMAGE;
  const heroImageSm = heroProduct?.image || FALLBACK_IMAGE_SM;
  const heroName    = heroProduct?.name  ?? null;
  const heroPrice   = heroProduct?.price != null ? formatRupiah(heroProduct.price) : null;
  const heroSlug    = heroProduct?.slug  ?? null;
  const heroHref    = heroSlug ? `/produk/${heroSlug}` : null;

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-texture -z-10" />
      <div className="absolute inset-0 bg-petal-gradient -z-10" />

      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-blush-200/35 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-cream-200/45 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blush-100/25 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container relative pt-8 pb-14 md:pt-16 md:pb-24 grid md:grid-cols-[1fr_auto] gap-8 md:gap-14 items-center">
        {/* ── Content column ─────────────────────────────────── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-5 max-w-lg"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur border border-blush-100/80 text-[11px] text-blush-700 font-medium shadow-[0_2px_10px_rgba(247,107,148,0.12)]">
              <Sparkles className="h-3 w-3 text-blush-500" />
              Premium Florist Rangkasbitung
            </span>
          </motion.div>

          <motion.div variants={item} className="space-y-2">
            <h1 className="font-serif text-[2.5rem] md:text-[3.4rem] lg:text-[3.8rem] text-ink-900 leading-[1.04] tracking-tight text-balance">
              {SITE.name}
            </h1>
            <p className="font-serif text-lg md:text-xl text-blush-600 italic font-light leading-snug">
              {SITE.tagline}
            </p>
          </motion.div>

          <motion.p variants={item} className="text-ink-500 text-[14px] md:text-[15px] leading-relaxed text-balance">
            {SITE.description}
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3 pt-1">
            <Link href="/katalog" className="btn-primary">
              Pesan Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/katalog" className="btn-secondary">
              Lihat Katalog
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            className="flex items-center gap-6 pt-5 border-t border-blush-100"
          >
            <StatItem number="500+" label="Happy Customers" />
            <Divider />
            <StatItem number="5★" label="Avg Rating" />
            <Divider />
            <StatItem number="Daily" label="Fresh Stock" />
          </motion.div>
        </motion.div>

        {/* ── Desktop image column ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 28, scale: 0.93 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden md:flex justify-center"
        >
          <div className="relative w-[340px] lg:w-[380px] aspect-[4/5]">
            {/* Glow aura */}
            <div className="absolute -inset-10 bg-gradient-to-br from-blush-200/55 to-cream-200/55 rounded-[4rem] blur-3xl opacity-75 pointer-events-none" />

            {/* Main product image — floating + clickable */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              className="group relative h-full rounded-[2.5rem] overflow-hidden border border-white/70 shadow-[0_28px_64px_-14px_rgba(154,70,92,0.28),0_0_0_1px_rgba(255,209,220,0.25)] hover:shadow-[0_36px_72px_-10px_rgba(154,70,92,0.38),0_0_0_1px_rgba(255,209,220,0.4)] transition-shadow duration-500"
            >
              <ImageWithFallback
                src={heroImage}
                alt={heroName ?? "Premium bouquet from Blush Petals.id"}
                fill
                priority
                sizes="420px"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />

              {/* Base gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/8 via-transparent to-white/8 pointer-events-none" />

              {/* Hover darkening tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-blush-900/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Full-area click target */}
              {heroHref && (
                <Link
                  href={heroHref}
                  className="absolute inset-0 z-10"
                  aria-label={`Lihat ${heroName ?? "produk"}`}
                />
              )}
            </motion.div>

            {/* ── BEST SELLER circular badge ── */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute -left-11 top-5 z-20"
            >
              <BadgeCircle href={heroHref} />
            </motion.div>

            {/* ── Floating product info card ── */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute -right-10 bottom-14 glass-premium rounded-2xl px-3.5 py-2.5 shadow-float max-w-[175px] z-20"
            >
              {heroHref ? (
                <Link href={heroHref} className="block group/card">
                  <p className="font-serif text-sm text-ink-900 leading-tight line-clamp-2 group-hover/card:text-blush-700 transition-colors">
                    {heroName}
                  </p>
                  {heroPrice && (
                    <p className="text-[11px] text-blush-600 font-semibold mt-1">{heroPrice}</p>
                  )}
                </Link>
              ) : (
                <>
                  <p className="font-serif text-sm text-ink-900 leading-tight">Blush Petals</p>
                  <p className="text-[10px] text-blush-500 mt-1 font-medium">Premium Florist</p>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Mobile image ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden relative mx-auto w-[240px] aspect-[4/5]"
        >
          <div className="absolute -inset-6 bg-gradient-to-br from-blush-200/50 to-cream-200/50 rounded-[3rem] blur-2xl pointer-events-none" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="group relative h-full rounded-[2rem] overflow-hidden border border-white/70 shadow-[0_16px_48px_-10px_rgba(154,70,92,0.25)]"
          >
            <ImageWithFallback
              src={heroImageSm}
              alt={heroName ?? "Premium bouquet from Blush Petals.id"}
              fill
              priority
              sizes="280px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/8 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-blush-900/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            {heroHref && (
              <Link
                href={heroHref}
                className="absolute inset-0 z-10"
                aria-label={`Lihat ${heroName ?? "produk"}`}
              />
            )}
          </motion.div>

          {/* Small badge on mobile */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -left-7 top-4 z-20"
          >
            <BadgeCircle href={heroHref} small />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── BEST SELLER circular badge ────────────────────────────────────

function BadgeCircle({ href, small }: { href: string | null; small?: boolean }) {
  const size = small ? "h-[72px] w-[72px]" : "h-[90px] w-[90px]";
  const text = small ? "text-[11px]" : "text-[14px]";

  const inner = (
    <div
      className={`
        relative ${size} rounded-full flex flex-col items-center justify-center text-center
        bg-gradient-to-br from-blush-500 to-blush-700
        shadow-[0_8px_24px_-4px_rgba(189,58,100,0.55),0_2px_8px_-2px_rgba(189,58,100,0.25)]
        hover:shadow-[0_12px_32px_-4px_rgba(189,58,100,0.68),0_4px_12px_-2px_rgba(189,58,100,0.38)]
        transition-shadow duration-300
        ${href ? "cursor-pointer" : ""}
      `}
    >
      {/* Glossy top-hemisphere highlight */}
      <div className="absolute top-2 inset-x-3 h-[40%] rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

      <p className={`font-sans font-extrabold ${text} text-white leading-none tracking-[0.12em] relative z-10`}>
        BEST
      </p>
      <p className={`font-sans font-extrabold ${text} text-white leading-none tracking-[0.12em] mt-[3px] relative z-10`}>
        SELLER
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Lihat produk Best Seller">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ── Sub-components ────────────────────────────────────────────────

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-xl md:text-2xl text-ink-900 leading-none">{number}</p>
      <p className="text-[11px] text-ink-400 mt-1">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-10 w-px bg-gradient-to-b from-transparent via-blush-200 to-transparent shrink-0" />;
}
