"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: ProductCardProps) {
  const soldOut = product.stock_status === "sold-out";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative rounded-3xl bg-white border border-blush-100/60 shadow-card hover:shadow-premium overflow-hidden flex flex-col transition-shadow duration-300"
    >
      {/* Image area — plain div so interactive siblings are never nested inside <a> */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-50 shrink-0">
        {/* Full-area invisible link for navigation — sibling to other elements, not parent */}
        <Link
          href={`/produk/${product.slug}`}
          className="absolute inset-0 z-[1]"
          aria-label={product.name}
          tabIndex={-1}
        />

        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]",
            soldOut && "grayscale opacity-75",
          )}
        />

        {/* Subtle base gradient — adds gentle depth at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/10 via-transparent to-transparent pointer-events-none" />

        {/* Badges */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-[2] pointer-events-none">
            <Badge variant="blush">{product.badge}</Badge>
          </div>
        )}
        {product.stock_status !== "tersedia" && (
          <div className="absolute top-3 right-3 z-[2] pointer-events-none">
            <Badge variant={soldOut ? "dark" : "cream"}>
              {STATUS_LABEL[product.stock_status]}
            </Badge>
          </div>
        )}

        {/* Wishlist button — z-[2], sibling of the invisible Link, not child */}
        {product.stock_status === "tersedia" && (
          <button
            type="button"
            aria-label="Simpan"
            className="absolute top-3 right-3 z-[2] h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center text-ink-400 hover:text-blush-500 hover:bg-white transition-all duration-200 shadow-card opacity-0 group-hover:opacity-100"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/produk/${product.slug}`} className="flex-1 block">
          <h3 className="font-serif text-[15px] text-ink-900 leading-snug line-clamp-1 group-hover:text-blush-700 transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-blush-600 font-semibold text-sm mt-1">
            {formatRupiah(product.price)}
          </p>
        </Link>
        <Link
          href={`/produk/${product.slug}`}
          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full text-[12px] font-medium bg-blush-50 text-blush-700 hover:bg-blush-100 hover:text-blush-800 transition-colors duration-150"
        >
          Lihat Detail
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}
