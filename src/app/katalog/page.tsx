import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { getProducts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Koleksi lengkap bouquet Blush Petals.id — artificial, premium, dan fresh flower.",
};

// Revalidate every 5 minutes — catalog should reflect stock changes quickly.
export const revalidate = 300;

export default async function KatalogPage() {
  const products = await getProducts();

  return (
    <section className="container py-6 md:py-10">
      <header className="mb-8 md:mb-12">
        <p className="section-label mb-4">Katalog Produk</p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink-900 leading-[1.08] tracking-tight">
          Temukan bouquet{" "}
          <span className="italic text-blush-600">sempurna</span>
          <br className="hidden md:block" /> untuk momenmu.
        </h1>
      </header>
      <Suspense fallback={<div className="text-sm text-ink-400">Memuat…</div>}>
        <CatalogClient products={products} />
      </Suspense>
    </section>
  );
}
