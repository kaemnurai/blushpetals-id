"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function CTA() {
  return (
    <section className="container pb-16 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-14 text-center"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-200" />
        <div className="absolute inset-0 bg-petal-gradient opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-blush-200/40 via-transparent to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blush-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-cream-300/25 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <Sparkles className="h-7 w-7 text-blush-500 mx-auto mb-4" />
          </motion.div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.4rem] text-ink-900 max-w-xl mx-auto leading-[1.1] tracking-tight text-balance">
            Buat momen spesialmu
            <br className="hidden md:block" />
            jadi lebih{" "}
            <span className="italic text-blush-600">bermakna.</span>
          </h2>
          <p className="text-ink-500 mt-4 max-w-sm mx-auto text-sm md:text-[15px] leading-relaxed">
            Custom bouquet sesuai keinginan. Pesan sekarang via WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={quickEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Chat WhatsApp
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/katalog" className="btn-secondary">
              Lihat Katalog
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
