"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/site";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Testimonials() {
  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <p className="section-label mb-4">Testimoni</p>
        <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-blush-300 to-transparent mx-auto mb-5" />
        <h2 className="section-title">
          Cerita dari{" "}
          <span className="italic text-blush-600">customer kami</span>
        </h2>
        <p className="text-ink-400 mt-4 text-sm md:text-[15px] max-w-xs mx-auto leading-relaxed">
          Setiap rangkaian membawa cerita yang tak terlupakan.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid md:grid-cols-3 gap-4 md:gap-5"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            variants={cardItem}
            className="relative rounded-3xl bg-white border border-blush-100/60 p-6 md:p-7 shadow-card hover:shadow-elevated transition-shadow duration-300 overflow-hidden group"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blush-50 to-transparent rounded-bl-[4rem] pointer-events-none" />

            <Quote className="absolute top-5 right-5 h-7 w-7 text-blush-100 group-hover:text-blush-200 transition-colors duration-300" />

            {/* Reviewer */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-blush-100 shadow-card shrink-0">
                <ImageWithFallback
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  fallbackSrc="/images/placeholder-avatar.svg"
                />
              </div>
              <div>
                <p className="font-medium text-ink-900 text-sm leading-tight">{t.name}</p>
                <p className="text-[11px] text-ink-400 mt-0.5">{t.role}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 mb-3 relative z-10">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="h-3.5 w-3.5 fill-blush-400 text-blush-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-[13px] md:text-sm text-ink-700 leading-relaxed relative z-10">
              "{t.quote}"
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
