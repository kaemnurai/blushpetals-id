import type { MetadataRoute } from "next";
import { DUMMY_PRODUCTS } from "@/lib/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://blushpetals.id";
  const now = new Date();
  const staticRoutes = ["", "/katalog", "/tentang", "/cara-pemesanan"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const productRoutes = DUMMY_PRODUCTS.map((p) => ({
    url: `${base}/produk/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...productRoutes];
}
