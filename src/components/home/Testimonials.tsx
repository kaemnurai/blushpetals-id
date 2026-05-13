"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/site";

export function Testimonials() {
  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-10">
        <p className="text-blush-600 text-xs uppercase tracking-widest mb-2">
          Testimoni
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900">
          Cerita dari customer kami
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-3xl bg-gradient-to-br from-white to-blush-50 border border-blush-100/60 p-6 shadow-card relative"
          >
            <Quote className="absolute top-5 right-5 h-6 w-6 text-blush-200" />
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-card">
                <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="font-medium text-ink-900 text-sm">{t.name}</p>
                <p className="text-xs text-ink-500">{t.role}</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2 text-blush-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">"{t.quote}"</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
