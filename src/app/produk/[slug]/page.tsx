import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DUMMY_PRODUCTS, getProductBySlug } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return DUMMY_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
