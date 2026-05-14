"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

export function Featured({ products }: { products: Product[] }) {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div>
          <p className="section-label mb-4">Produk Unggulan</p>
          <h2 className="section-title">
            Bouquet <span className="italic text-blush-600">favorit</span>
            <br />
            customer kami
          </h2>
        </div>
      </div>

      <ProductGrid products={products} />

      <div className="text-center mt-8 md:mt-10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/katalog"
            className="btn-secondary inline-flex"
          >
            Lihat semua produk
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
