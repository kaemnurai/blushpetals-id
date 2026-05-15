"use client";

/**
 * Admin CRUD services — client-side only.
 * All functions use getSupabaseBrowserClient() and must be called
 * from Client Components / event handlers.
 */

import { getSupabaseBrowserClient } from "./client";
import { rowToProduct } from "./queries";
import { slugify } from "@/lib/utils";
import type {
  Product,
  ProductCategory,
  ProductStatus,
  StockStatus,
  Order,
  OrderStatus,
  ProductImage,
} from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────

function sb() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

// ================================================================
// PRODUCT CRUD
// ================================================================

export interface ProductPayload {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  capital_price?: number;
  category: ProductCategory;
  category_id?: string | null;
  status: ProductStatus;
  stock_status: StockStatus;
  badge?: string | null;
  wrapping_options?: string[];
  is_hero_product?: boolean;
  is_featured_home?: boolean;
}

/**
 * One image slot from the admin form.
 * - existingUrl: URL already in DB; "" means the slot was cleared.
 * - newFile: new file chosen by admin; null means no change.
 */
export interface ImageSlotInput {
  existingUrl: string;
  newFile: File | null;
}

function toDbRow(payload: ProductPayload, imageUrl: string) {
  return {
    title:            payload.name.trim(),
    slug:             (payload.slug?.trim() || slugify(payload.name)).trim(),
    description:      payload.description ?? "",
    price:            Number(payload.price) || 0,
    capital_price:    Number(payload.capital_price) || 0,
    category:         payload.category,
    category_id:      payload.category_id ?? null,
    status:           payload.status,
    stock_status:     payload.stock_status,
    image:            imageUrl,
    badge:            payload.badge || null,
    wrapping_options: payload.wrapping_options ?? [],
    is_hero_product:  payload.is_hero_product ?? false,
    is_featured_home: payload.is_featured_home ?? false,
  };
}

type DbRow = ReturnType<typeof toDbRow>;

// Detects errors caused by capital_price column not existing in DB.
function isCapitalPriceColumnMissing(msg: string): boolean {
  const m = (msg ?? "").toLowerCase();
  return m.includes("capital_price");
}

const MIGRATION_ERROR_MSG =
  "Kolom 'capital_price' belum ada di database. " +
  "Buka Supabase Dashboard → SQL Editor, lalu jalankan file " +
  "migration-capital-price.sql (atau migration-all.sql) untuk mengaktifkan fitur Harga Modal & Profit.";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeInsertProduct(supabase: any, row: DbRow): Promise<Record<string, unknown>> {
  console.log("[Product Insert] Payload yang dikirim ke Supabase:", row);

  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select()
    .single();

  if (!error) {
    if (!data) throw new Error("Insert berhasil tapi tidak ada data yang dikembalikan.");
    return data as Record<string, unknown>;
  }

  if (isCapitalPriceColumnMissing(error.message)) {
    console.error("[Product Insert] Kolom capital_price tidak ada di DB:", error.message);
    throw new Error(MIGRATION_ERROR_MSG);
  }

  throw new Error(error.message);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeUpdateProduct(supabase: any, id: string, row: DbRow): Promise<Record<string, unknown>> {
  console.log("[Product Update] Payload yang dikirim ke Supabase:", row);

  // Step 1: run the UPDATE
  const { error: updateError } = await supabase
    .from("products")
    .update(row)
    .eq("id", id);

  if (updateError) {
    if (isCapitalPriceColumnMissing(updateError.message)) {
      console.error("[Product Update] Kolom capital_price tidak ada di DB:", updateError.message);
      throw new Error(MIGRATION_ERROR_MSG);
    }
    throw new Error(updateError.message);
  }

  // Step 2: SELECT the updated row (separate query — avoids PGRST116 issues)
  const { data, error: selectError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (selectError) throw new Error(selectError.message);
  if (!data) throw new Error(`Produk dengan ID ${id} tidak ditemukan setelah update.`);

  return data as Record<string, unknown>;
}

// ── Create product ────────────────────────────────────────────────

export async function adminCreateProduct(
  payload: ProductPayload,
  imageSlots: ImageSlotInput[],
): Promise<Product> {
  const supabase = sb();

  if (payload.is_featured_home) await assertFeaturedHomeSlot(null, supabase);

  const imageUrls  = await resolveImageSlots(imageSlots, payload.name, supabase);
  const primaryUrl = imageUrls[0] ?? "";

  const data    = await safeInsertProduct(supabase, toDbRow(payload, primaryUrl));
  const product = rowToProduct(data);

  await saveProductImages(product.id, imageUrls, supabase);
  if (payload.is_hero_product) await applyHeroFlag(product.id, supabase);

  return product;
}

// ── Update product ────────────────────────────────────────────────

export async function adminUpdateProduct(
  id: string,
  payload: ProductPayload,
  imageSlots: ImageSlotInput[],
): Promise<Product> {
  const supabase = sb();

  if (payload.is_featured_home) await assertFeaturedHomeSlot(id, supabase);

  const imageUrls  = await resolveImageSlots(imageSlots, payload.name, supabase);
  const primaryUrl = imageUrls[0] ?? "";

  const data    = await safeUpdateProduct(supabase, id, toDbRow(payload, primaryUrl));
  const product = rowToProduct(data);

  await saveProductImages(id, imageUrls, supabase);
  if (payload.is_hero_product) await applyHeroFlag(id, supabase);

  return product;
}

// ── Delete product ────────────────────────────────────────────────

export async function adminDeleteProduct(id: string): Promise<void> {
  const supabase = sb();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Hero product ──────────────────────────────────────────────────

export async function adminSetHeroProduct(id: string): Promise<void> {
  await applyHeroFlag(id, sb());
}

// ── Featured home toggle ──────────────────────────────────────────

export async function adminToggleFeaturedHome(
  id: string,
  value: boolean,
): Promise<void> {
  const supabase = sb();
  if (value) await assertFeaturedHomeSlot(id, supabase);
  const { error } = await supabase
    .from("products")
    .update({ is_featured_home: value })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Quick status update ───────────────────────────────────────────

export async function adminUpdateProductStatus(
  id: string,
  stock_status: StockStatus,
  status?: ProductStatus,
): Promise<void> {
  const supabase = sb();
  const update: Record<string, unknown> = { stock_status };
  if (status) update.status = status;
  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Product images (read / legacy helpers) ────────────────────────

export async function adminGetProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = sb();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")
    .limit(3);
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductImage[];
}

export async function adminDeleteProductImage(
  imageId: string,
  imageUrl: string,
): Promise<void> {
  const supabase = sb();
  await supabase.from("product_images").delete().eq("id", imageId);
  const path = imageUrl.split("/products/")[1];
  if (path) await supabase.storage.from("products").remove([path]);
}

export async function adminSetThumbnail(
  productId: string,
  imageId: string,
  imageUrl: string,
): Promise<void> {
  const supabase = sb();
  await supabase
    .from("product_images")
    .update({ is_thumbnail: false })
    .eq("product_id", productId);
  await supabase
    .from("product_images")
    .update({ is_thumbnail: true })
    .eq("id", imageId);
  await supabase.from("products").update({ image: imageUrl }).eq("id", productId);
}

export async function adminAddProductImages(
  productId: string,
  files: File[],
  productName: string,
): Promise<ProductImage[]> {
  const supabase = sb();
  await addProductImages(productId, files, supabase, productName);
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  return (data ?? []) as ProductImage[];
}

// ================================================================
// ORDER MANAGEMENT
// ================================================================

// Row mapper — tolerates old schemas where some columns may not exist
function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id:              String(row.id ?? ""),
    customer_name:   String(row.customer_name ?? ""),
    whatsapp:        String(row.whatsapp ?? ""),
    order_date:      (row.order_date  as string | null) ?? null,
    pickup_date:     (row.pickup_date as string | null) ?? null,
    order_notes:     String(row.order_notes ?? ""),
    wrapping:        String(row.wrapping ?? ""),
    delivery_method: String(row.delivery_method ?? ""),
    greeting_card:   String(row.greeting_card ?? ""),
    status:          (row.status as OrderStatus) ?? "pending",
    total_price:     Number(row.total_price ?? 0),
    extra_cost:      Number(row.extra_cost ?? 0),
    extra_cost_note: (row.extra_cost_note as string | null) ?? null,
    created_at:      String(row.created_at ?? ""),
    items: ((row.order_items as Record<string, unknown>[]) ?? []).map((it) => ({
      id:           String(it.id ?? ""),
      order_id:     String(row.id ?? ""),
      product_id:   (it.product_id as string | null) ?? null,
      quantity:     Number(it.quantity ?? 1),
      price:        Number(it.price ?? 0),
      product_name:  ((it.products as { title?: string; image?: string } | null)?.title) ?? "Produk dihapus",
      product_image: ((it.products as { title?: string; image?: string } | null)?.image) ?? null,
    })),
  };
}

export async function adminGetOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = sb();

  // ── Attempt 1: full query with all columns ──────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q1: any = supabase
    .from("orders")
    .select(`
      id, customer_name, whatsapp,
      order_date, pickup_date, order_notes,
      wrapping, delivery_method, greeting_card,
      status, total_price, extra_cost, extra_cost_note, created_at,
      order_items ( id, product_id, quantity, price, products ( title, image ) )
    `)
    .order("created_at", { ascending: false });
  if (status) q1 = q1.eq("status", status);

  const { data: data1, error: err1 } = await q1;

  if (!err1) {
    console.log("[adminGetOrders] Full query:", data1?.length ?? 0, "orders");
    return ((data1 ?? []) as Record<string, unknown>[]).map(mapOrderRow);
  }

  // ── Attempt 2: fallback — minimal columns guaranteed on all schema versions ──
  const isSchemaError =
    err1.message.includes("schema cache") ||
    err1.message.includes("Could not find") ||
    err1.message.includes("delivery_method") ||
    err1.message.includes("greeting_card") ||
    err1.message.includes("order_date") ||
    err1.message.includes("extra_cost");

  if (!isSchemaError) {
    console.error("[adminGetOrders] Error:", err1.message);
    throw new Error(err1.message);
  }

  console.warn(
    "[adminGetOrders] Skema lama terdeteksi — gunakan query minimal.\n" +
    "SOLUSI: Jalankan migration-orders-v2.sql di Supabase SQL Editor.",
    err1.message,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q2: any = supabase
    .from("orders")
    .select(`
      id, customer_name, whatsapp,
      pickup_date, order_notes, wrapping,
      status, total_price, created_at,
      order_items ( id, product_id, quantity, price, products ( title, image ) )
    `)
    .order("created_at", { ascending: false });
  if (status) q2 = q2.eq("status", status);

  const { data: data2, error: err2 } = await q2;

  if (err2) throw new Error(err2.message);

  console.log("[adminGetOrders] Fallback query:", data2?.length ?? 0, "orders");
  return ((data2 ?? []) as Record<string, unknown>[]).map(mapOrderRow);
}

export async function adminUpdateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const supabase = sb();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminAcceptOrderWithCost(
  id: string,
  extraCost: number,
  extraCostNote: string | null,
): Promise<void> {
  const supabase = sb();

  const payload: Record<string, unknown> = { status: "accepted" };
  if (extraCost > 0) {
    payload.extra_cost = extraCost;
    payload.extra_cost_note = extraCostNote ?? null;
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", id);

  if (!error) return;

  // Fallback: extra_cost column may not exist yet — just update status
  if (error.message.includes("extra_cost") || error.message.includes("schema cache") || error.message.includes("Could not find")) {
    const { error: err2 } = await supabase.from("orders").update({ status: "accepted" }).eq("id", id);
    if (err2) throw new Error(err2.message);
    return;
  }

  throw new Error(error.message);
}

export async function adminDeleteOrder(id: string): Promise<void> {
  const supabase = sb();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ================================================================
// PRIVATE HELPERS
// ================================================================

async function uploadImageFile(
  file: File,
  productName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${slugify(productName)}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl as string;
}

/**
 * Upload any new files in slots; return resolved URLs for each non-empty slot.
 * Order matches the input slots — empty slots are omitted from the result.
 */
async function resolveImageSlots(
  slots: ImageSlotInput[],
  productName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string[]> {
  const urls: string[] = [];
  for (const slot of slots) {
    if (slot.newFile) {
      const url = await uploadImageFile(slot.newFile, productName, supabase);
      urls.push(url);
    } else if (slot.existingUrl) {
      urls.push(slot.existingUrl);
    }
    // empty slot → omit
  }
  return urls;
}

/**
 * Atomically replace all product_images rows with the given ordered URLs.
 * Slot 0 is marked as_thumbnail = true and maps to products.image.
 */
async function saveProductImages(
  productId: string,
  urls: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<void> {
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (urls.length === 0) return;
  const rows = urls.map((url, i) => ({
    product_id:   productId,
    image_url:    url,
    is_thumbnail: i === 0,
    sort_order:   i,
  }));
  await supabase.from("product_images").insert(rows);
}

async function addProductImages(
  productId: string,
  files: File[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  productName = "product",
): Promise<string[]> {
  const { data: existing } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let order = existing?.[0]?.sort_order ?? -1;
  const urls: string[] = [];

  for (const file of files) {
    const url = await uploadImageFile(file, productName, supabase);
    order += 1;
    await supabase.from("product_images").insert({
      product_id:   productId,
      image_url:    url,
      is_thumbnail: false,
      sort_order:   order,
    });
    urls.push(url);
  }
  return urls;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyHeroFlag(id: string, supabase: any): Promise<void> {
  await supabase
    .from("products")
    .update({ is_hero_product: false })
    .eq("is_hero_product", true);
  await supabase
    .from("products")
    .update({ is_hero_product: true })
    .eq("id", id);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertFeaturedHomeSlot(excludeId: string | null, supabase: any): Promise<void> {
  let q = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_featured_home", true);
  if (excludeId) q = q.neq("id", excludeId);
  const { count } = await q;
  if ((count ?? 0) >= 4) {
    throw new Error(
      "Maksimal 4 produk dapat ditampilkan di section Featured. Hapus salah satu terlebih dahulu.",
    );
  }
}
