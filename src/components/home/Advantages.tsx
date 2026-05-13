"use client";

import { motion } from "framer-motion";
import { Flower2, Sparkles, MessageCircleHeart, Truck } from "lucide-react";
import { ADVANTAGES } from "@/lib/data/site";

const ICONS = {
  flower: Flower2,
  sparkles: Sparkles,
  message: MessageCircleHeart,
  truck: Truck,
};

export function Advantages() {
  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-10">
        <p className="text-blush-600 text-xs uppercase tracking-widest mb-2">
          Keunggulan Kami
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900">
          Kenapa pilih Blush Petals?
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {ADVANTAGES.map((a, i) => {
          const Icon = ICONS[a.icon as keyof typeof ICONS] ?? Flower2;
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-3xl bg-white border border-blush-100/60 p-5 text-center shadow-card hover:shadow-soft transition"
            >
              <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-blush-100 to-cream-100 flex items-center justify-center text-blush-600 mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base text-ink-900">{a.title}</h3>
              <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">{a.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
