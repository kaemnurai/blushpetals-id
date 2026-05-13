"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function CTA() {
  return (
    <section className="container pb-16 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blush-100 via-cream-100 to-blush-200 p-8 md:p-14 text-center"
      >
        <div className="absolute inset-0 bg-petal-gradient opacity-60" />
        <div className="relative">
          <Sparkles className="h-7 w-7 text-blush-500 mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-5xl text-ink-900 max-w-2xl mx-auto text-balance">
            Buat momen spesialmu jadi lebih bermakna.
          </h2>
          <p className="text-ink-500 mt-4 max-w-md mx-auto text-sm md:text-base">
            Custom bouquet sesuai keinginan. Pesan sekarang via WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={quickEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink-900 text-white hover:brightness-110 transition text-sm"
            >
              Chat WhatsApp
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-ink-900 hover:bg-blush-50 transition text-sm border border-blush-200"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
