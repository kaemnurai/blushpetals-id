"use client";

/**
 * Customer-facing order creation — uses the public anon Supabase client.
 * The orders table has a public INSERT policy, so no authentication is needed.
 *
 * Defensive strategy: tries full insert with all fields first.
 * If the DB schema is missing newer columns (delivery_method, greeting_card,
 * order_date), falls back to a minimal insert that packs the extra info into
 * order_notes — so orders always save successfully even on old schemas.
 *
 * To unlock full schema: run migration-orders-v2.sql in Supabase SQL Editor.
 */

import { getSupabaseBrowserClient } from "./client";
import type { OrderForm, Product } from "@/lib/types";

// Helper: detect "column not found in schema cache" errors
function isMissingColumnError(msg: string): boolean {
  return (
    msg.includes("schema cache") ||
    msg.includes("Could not find") ||
    msg.includes("delivery_method") ||
    msg.includes("greeting_card") ||
    msg.includes("order_date")
  );
}

export async function createOrder(form: OrderForm, product: Product): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Layanan database tidak tersedia.");

  // ── Attempt 1: full insert (all columns) ────────────────────────
  const fullRow = {
    customer_name:   form.customerName.trim(),
    whatsapp:        form.whatsapp.trim(),
    order_date:      form.orderDate   || null,
    pickup_date:     form.pickupDate  || null,
    order_notes:     form.note        ?? "",
    wrapping:        form.wrappingColor ?? "",
    delivery_method: form.method      ?? "ambil",
    greeting_card:   form.cardMessage ?? "",
    status:          "pending",
    total_price:     product.price,
  };

  console.log("[createOrder] Attempt 1 — full insert:", {
    customer: fullRow.customer_name,
    product:  product.name,
    price:    product.price,
    method:   fullRow.delivery_method,
  });

  const { data: order1, error: err1 } = await supabase
    .from("orders")
    .insert(fullRow)
    .select("id")
    .single();

  if (!err1) {
    const orderId = order1.id as string;
    console.log("[createOrder] Full insert sukses. ID:", orderId);
    await insertOrderItem(supabase, orderId, product);
    return orderId;
  }

  console.error("[createOrder] Full insert error:", err1.message);

  // ── Attempt 2: fallback — minimal columns that every schema version has ──
  if (!isMissingColumnError(err1.message)) {
    throw new Error(`Gagal menyimpan pesanan: ${err1.message}`);
  }

  console.warn(
    "[createOrder] Kolom hilang terdeteksi. Gunakan fallback insert.\n" +
    "SOLUSI: Jalankan file migration-orders-v2.sql di Supabase SQL Editor.",
  );

  // Pack extra info into order_notes so nothing is silently lost
  const notesParts = [
    form.note?.trim() || "",
    form.ribbonColor?.trim() ? `Pita: ${form.ribbonColor.trim()}` : "",
    `Metode: ${form.method === "diantar" ? "Diantar" : "Ambil di Toko"}`,
    form.cardMessage?.trim() ? `Kartu: ${form.cardMessage.trim()}` : "",
  ].filter(Boolean);

  const fallbackRow = {
    customer_name: form.customerName.trim(),
    whatsapp:      form.whatsapp.trim(),
    pickup_date:   form.pickupDate || null,
    order_notes:   notesParts.join(" | "),
    wrapping:      form.wrappingColor ?? "",
    status:        "pending",
    total_price:   product.price,
  };

  console.log("[createOrder] Attempt 2 — fallback insert:", fallbackRow);

  const { data: order2, error: err2 } = await supabase
    .from("orders")
    .insert(fallbackRow)
    .select("id")
    .single();

  if (err2) {
    console.error("[createOrder] Fallback insert error:", err2.message);
    throw new Error(`Gagal menyimpan pesanan: ${err2.message}`);
  }

  const orderId = order2.id as string;
  console.log("[createOrder] Fallback insert sukses. ID:", orderId);

  await insertOrderItem(supabase, orderId, product);
  return orderId;
}

// ── private helper ────────────────────────────────────────────────

async function insertOrderItem(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orderId: string,
  product: Product,
): Promise<void> {
  const { error } = await supabase.from("order_items").insert({
    order_id:   orderId,
    product_id: product.id,
    quantity:   1,
    price:      product.price,
  });

  if (error) {
    console.error("[createOrder] insertOrderItem error:", error.message);
    throw new Error(`Gagal menyimpan item pesanan: ${error.message}`);
  }

  console.log("[createOrder] Order item tersimpan. product_id:", product.id);
}
