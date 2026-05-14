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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Advantages() {
  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <p className="section-label mb-4">Keunggulan Kami</p>
        <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-blush-300 to-transparent mx-auto mb-5" />
        <h2 className="section-title">
          Kenapa pilih{" "}
          <span className="italic text-blush-600">Blush Petals?</span>
        </h2>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {ADVANTAGES.map((a) => {
          const Icon = ICONS[a.icon as keyof typeof ICONS] ?? Flower2;
          return (
            <motion.div
              key={a.title}
              variants={cardItem}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
              className="group rounded-3xl bg-white border border-blush-100/60 p-5 md:p-6 text-center shadow-card hover:shadow-premium transition-shadow duration-300 cursor-default"
            >
              <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-blush-50 to-cream-100 border border-blush-100/50 flex items-center justify-center text-blush-500 mb-4 group-hover:from-blush-100 group-hover:to-cream-200 transition-colors duration-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base text-ink-900 mb-1.5">{a.title}</h3>
              <p className="text-[12px] md:text-xs text-ink-500 leading-relaxed">{a.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
