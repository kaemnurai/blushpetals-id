"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

export function Featured({ products }: { products: Product[] }) {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-blush-600 text-xs uppercase tracking-widest mb-2">
            Produk Unggulan
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-900">
            Bouquet favorit
            <br />
            customer kami
          </h2>
        </div>
      </div>
      <ProductGrid products={products} />
      <div className="text-center mt-8">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-ink-900 border border-blush-100 hover:bg-blush-50 transition text-sm"
        >
          Lihat semua produk
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
