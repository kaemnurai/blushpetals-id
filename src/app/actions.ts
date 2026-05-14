"use server";

import { revalidatePath } from "next/cache";

/**
 * Busts the ISR cache for every page that renders product data.
 * Call this from client components after any admin product mutation
 * (create, update, delete) so the public site reflects changes immediately
 * instead of waiting for the 300-second revalidation window.
 */
export async function revalidateProductPages(): Promise<void> {
  revalidatePath("/");                          // homepage (hero + featured)
  revalidatePath("/katalog");                   // catalog
  revalidatePath("/produk/[slug]", "page");     // all product detail pages
}
