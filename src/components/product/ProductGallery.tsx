"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [idx, setIdx] = React.useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-cream-50 border border-blush-100/60 shadow-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={images[idx]}
              alt={alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIdx(i)}
              className={cn(
                "relative shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border transition",
                idx === i ? "border-blush-500 ring-2 ring-blush-200" : "border-blush-100",
              )}
              aria-label={`Gambar ${i + 1}`}
            >
              <Image src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
