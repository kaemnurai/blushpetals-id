"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="py-20 text-center text-ink-500">
        <p className="font-serif text-xl mb-1 text-ink-900">Belum ada produk</p>
        <p className="text-sm">Silakan cek kembali nanti ✿</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
    >
      {products.map((p, idx) => (
        <motion.div
          key={p.id}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
          }}
        >
          <ProductCard product={p} priority={idx < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}
