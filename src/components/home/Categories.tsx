"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    label: "Artificial Bouquet",
    desc: "Tahan lama, cantik untuk koleksi",
    href: "/katalog?cat=artificial-bouquet",
    img: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&auto=format&fit=crop&q=80",
  },
  {
    label: "Premium Collection",
    desc: "Signature jumbo, eksklusif",
    href: "/katalog?cat=premium-collection",
    img: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=900&auto=format&fit=crop&q=80",
  },
  {
    label: "Fresh Flower",
    desc: "Bunga segar harian",
    href: "/katalog?cat=fresh-flower",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=900&auto=format&fit=crop&q=80",
  },
];

export function Categories() {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-blush-600 text-xs uppercase tracking-widest mb-2">
            Kategori Pilihan
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-900">
            Pilih bouquet
            <br />
            kesukaan Anda
          </h2>
        </div>
        <Link
          href="/katalog"
          className="hidden md:inline-flex items-center gap-1 text-sm text-blush-700 hover:text-blush-600"
        >
          Lihat semua
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-5">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              href={c.href}
              className="group block relative rounded-3xl overflow-hidden aspect-[5/6] md:aspect-[4/5] shadow-card border border-blush-100/60"
            >
              <Image
                src={c.img}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="font-serif text-2xl">{c.label}</p>
                <p className="text-xs opacity-80 mt-1">{c.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/20 backdrop-blur border border-white/30">
                  Lihat koleksi <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
