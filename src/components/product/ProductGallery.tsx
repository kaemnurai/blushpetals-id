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
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  // Clamp idx if images array shrinks (edge-case safety)
  const safeIdx = Math.min(idx, Math.max(0, images.length - 1));

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(images.length - 1, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (dy > 40) return; // vertical scroll — ignore
    if (dx > 50) next();
    if (dx < -50) prev();
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-cream-50 border border-blush-100/60 shadow-card select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIdx}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={images[safeIdx]}
              alt={`${alt} ${safeIdx + 1}`}
              fill
              priority={safeIdx === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrow controls — only visible on desktop when 2+ images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={safeIdx === 0}
              aria-label="Sebelumnya"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur border border-white/60 shadow text-ink-700 hover:text-blush-600 disabled:opacity-30 transition z-10"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              disabled={safeIdx === images.length - 1}
              aria-label="Berikutnya"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur border border-white/60 shadow text-ink-700 hover:text-blush-600 disabled:opacity-30 transition z-10"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {/* Image counter badge (mobile) */}
        {images.length > 1 && (
          <span className="md:hidden absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-ink-900/50 text-white text-[10px] backdrop-blur">
            {safeIdx + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Mobile dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Gambar ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === safeIdx ? "w-5 bg-blush-500" : "w-1.5 bg-blush-200",
              )}
            />
          ))}
        </div>
      )}

      {/* Desktop thumbnail strip */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIdx(i)}
              aria-label={`Gambar ${i + 1}`}
              className={cn(
                "relative shrink-0 h-20 w-20 rounded-2xl overflow-hidden border-2 transition",
                i === safeIdx
                  ? "border-blush-500 ring-2 ring-blush-200"
                  : "border-blush-100 hover:border-blush-300",
              )}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
