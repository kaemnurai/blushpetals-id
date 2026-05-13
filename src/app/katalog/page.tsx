import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { DUMMY_PRODUCTS } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Koleksi lengkap bouquet Blush Petals.id — artificial, premium, dan fresh flower.",
};

export default function KatalogPage() {
  return (
    <section className="container py-6 md:py-10">
      <header className="mb-6 md:mb-10">
        <p className="text-blush-600 text-xs uppercase tracking-widest mb-2">
          Katalog Produk
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink-900">
          Temukan bouquet
          <br className="hidden md:block" /> sempurna untuk momenmu.
        </h1>
      </header>
      <Suspense fallback={<div className="text-sm text-ink-400">Memuat…</div>}>
        <CatalogClient products={DUMMY_PRODUCTS} />
      </Suspense>
    </section>
  );
}
