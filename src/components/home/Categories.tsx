"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { ProductCategory } from "@/lib/types";

// ── Static category metadata ──────────────────────────────────────
// Images are injected dynamically via `covers` prop (pulled from the
// product that best represents each category). The fallback URLs here
// are used only when no product image is available.

const CATEGORIES: {
  key: ProductCategory;
  label: string;
  desc: string;
  href: string;
  fallback: string;
  accent: string;
}[] = [
  {
    key:      "artificial-bouquet",
    label:    "Artificial Bouquet",
    desc:     "Tahan lama, cantik untuk koleksi",
    href:     "/katalog?cat=artificial-bouquet",
    fallback: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&auto=format&fit=crop&q=80",
    accent:   "from-blush-500/30 to-blush-700/50",
  },
  {
    key:      "premium-collection",
    label:    "Premium Collection",
    desc:     "Signature jumbo, eksklusif",
    href:     "/katalog?cat=premium-collection",
    fallback: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=900&auto=format&fit=crop&q=80",
    accent:   "from-ink-800/20 to-ink-900/60",
  },
  {
    key:      "fresh-flower",
    label:    "Fresh Flower",
    desc:     "Bunga segar harian",
    href:     "/katalog?cat=fresh-flower",
    fallback: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=900&auto=format&fit=crop&q=80",
    accent:   "from-blush-400/20 to-blush-800/55",
  },
  {
    key:      "custom",
    label:    "Custom",
    desc:     "Desain bouquet sesuai keinginanmu",
    href:     "/katalog?cat=custom",
    fallback: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80",
    accent:   "from-blush-300/25 to-blush-700/60",
  },
];

interface CategoriesProps {
  /** Map of category key → representative product image URL.
   *  Fetched server-side via getCategoryCovers(); falls back to
   *  static Unsplash images when a key is missing or empty. */
  covers?: Partial<Record<ProductCategory, string>>;
}

export function Categories({ covers }: CategoriesProps) {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div>
          <p className="section-label mb-4">Kategori Pilihan</p>
          <h2 className="section-title">
            Pilih bouquet{" "}
            <span className="italic text-blush-600">kesukaan</span>
            <br />
            Anda
          </h2>
        </div>
        <Link
          href="/katalog"
          className="hidden md:inline-flex items-center gap-1 text-sm text-blush-600 hover:text-blush-700 font-medium transition-colors"
        >
          Lihat semua
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => {
          // Use dynamic product image when available; otherwise fall back.
          const imgSrc = covers?.[c.key] || c.fallback;

          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={c.href}
                className="group block relative rounded-3xl overflow-hidden aspect-[5/6] md:aspect-[4/5] shadow-card border border-white/60 hover:shadow-premium transition-shadow duration-300"
              >
                {/* Dynamic product image */}
                <ImageWithFallback
                  src={imgSrc}
                  alt={c.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
                />

                {/* Gradient overlay for text legibility */}
                <div className={`absolute inset-0 bg-gradient-to-t ${c.accent} transition-opacity duration-300`} />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                  <p className="font-serif text-[1.4rem] md:text-2xl leading-tight">{c.label}</p>
                  <p className="text-xs text-white/75 mt-1">{c.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 transition-all duration-200 group-hover:bg-white/25">
                    Lihat koleksi
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Shine on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
