"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: ProductCardProps) {
  const soldOut = product.stock_status === "sold-out";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="group relative rounded-3xl bg-white border border-blush-100/60 shadow-card overflow-hidden flex flex-col"
    >
      <Link href={`/produk/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-cream-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-700 group-hover:scale-110",
            soldOut && "grayscale opacity-80",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/10 via-transparent to-transparent" />

        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="blush">{product.badge}</Badge>
          </div>
        )}
        {product.stock_status !== "tersedia" && (
          <div className="absolute top-3 right-3">
            <Badge variant={soldOut ? "dark" : "cream"}>
              {STATUS_LABEL[product.stock_status]}
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/produk/${product.slug}`} className="flex-1">
          <h3 className="font-serif text-base text-ink-900 leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-blush-600 font-medium text-sm mt-1">
            {formatRupiah(product.price)}
          </p>
        </Link>
        <div className="flex items-center gap-2 pt-2">
          <Link
            href={`/produk/${product.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full text-xs font-medium bg-blush-50 text-blush-700 hover:bg-blush-100 transition"
          >
            Lihat Detail
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
