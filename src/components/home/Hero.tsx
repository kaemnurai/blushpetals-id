"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/data/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-blush-gradient -z-10" />
      <div className="absolute inset-0 bg-petal-gradient -z-10 opacity-80" />

      <div className="container relative pt-10 pb-16 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5 order-2 md:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-blush-100 text-xs text-blush-700">
            <Sparkles className="h-3 w-3" />
            Premium Florist Bandung
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-ink-900 leading-[1.05] text-balance">
            {SITE.name}
            <span className="block text-blush-600 mt-2 text-2xl md:text-3xl font-sans font-light italic">
              {SITE.tagline}
            </span>
          </h1>

          <p className="text-ink-500 text-sm md:text-base max-w-md text-balance">
            {SITE.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-soft hover:shadow-glow transition text-sm"
            >
              Pesan Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-ink-900 border border-blush-100 hover:bg-blush-50 transition text-sm"
            >
              Lihat Katalog
            </Link>
          </div>

          <div className="flex items-center gap-5 pt-6 text-xs text-ink-500">
            <div>
              <p className="text-2xl font-serif text-ink-900">500+</p>
              <p>Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-blush-200" />
            <div>
              <p className="text-2xl font-serif text-ink-900">4.9★</p>
              <p>Rating Bintang</p>
            </div>
            <div className="h-8 w-px bg-blush-200" />
            <div>
              <p className="text-2xl font-serif text-ink-900">Daily</p>
              <p>Fresh Stock</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative order-1 md:order-2"
        >
          <div className="relative aspect-[4/5] max-w-md mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-br from-blush-200/50 to-cream-200/50 rounded-[3rem] blur-3xl" />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white shadow-glow"
            >
              <Image
                src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80"
                alt="Bouquet hero"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 480px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -left-3 md:-left-10 top-10 glass rounded-2xl p-3 shadow-soft"
            >
              <p className="text-xs text-ink-500">Today's Pick</p>
              <p className="font-serif text-sm text-ink-900">Fresh Rose Bouquet</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute -right-3 md:-right-8 bottom-12 glass rounded-2xl p-3 shadow-soft"
            >
              <p className="text-xs text-ink-500">Wisuda Edition</p>
              <p className="font-serif text-sm text-ink-900">100+ Bouquet</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
