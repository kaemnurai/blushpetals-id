import { SITE } from "@/lib/data/site";
import type { OrderForm, CartItem, CartOrderForm } from "@/lib/types";
import { formatDateID, formatRupiah } from "@/lib/utils";

export function buildOrderMessage(form: OrderForm, orderId?: string): string {
  const ref = orderId ? `#${orderId.slice(-6).toUpperCase()}` : null;
  // CART FEATURE START
  const qtyLine = (form.quantity ?? 1) > 1 ? [`Qty             : ${form.quantity}`] : [];
  // CART FEATURE END
  const lines = [
    "Halo Blush Petals.id 🌸",
    "",
    "Saya ingin memesan bouquet:",
    ...(ref ? [`ID Pesanan: ${ref}`, ""] : [""]),
    `Nama            : ${form.customerName}`,
    `No WhatsApp     : ${form.whatsapp}`,
    `Produk          : ${form.productName}`,
    ...qtyLine,
    `Harga           : ${form.price ? formatRupiah(form.price) : "-"}`,
    `Tanggal Pesan   : ${form.orderDate  ? formatDateID(form.orderDate)  : "-"}`,
    `Tanggal Ambil   : ${form.pickupDate ? formatDateID(form.pickupDate) : "-"}`,
    `Warna Wrapping  : ${form.wrappingColor || "-"}`,
    `Pita            : ${form.ribbonColor || "-"}`,
    `Metode          : ${form.method === "diantar" ? "Diantar" : "Ambil di Toko"}`,
    `Kartu Ucapan    : ${form.cardMessage || "-"}`,
    `Catatan         : ${form.note || "-"}`,
    "",
    "Terima kasih. 🌸",
  ];
  return lines.join("\n");
}

// CART FEATURE START
export function buildCartOrderMessage(
  form: CartOrderForm,
  items: CartItem[],
  orderId?: string,
): string {
  const ref = orderId ? `#${orderId.slice(-6).toUpperCase()}` : null;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const itemLines: string[] = [];
  items.forEach((item, idx) => {
    itemLines.push(
      `${idx + 1}.`,
      `Produk   : ${item.productName}`,
      `Qty       : ${item.quantity}`,
      `Harga     : ${formatRupiah(item.price)}`,
      `Subtotal  : ${formatRupiah(item.price * item.quantity)}`,
      `Wrapping  : ${item.wrapping || "-"}`,
      `Pita      : ${item.ribbon || "-"}`,
      "",
    );
  });

  const lines = [
    "Halo Blush Petals.id 🌸",
    "",
    "Saya ingin memesan bouquet:",
    ...(ref ? [`ID Pesanan: ${ref}`, ""] : [""]),
    "======================",
    "DAFTAR PESANAN",
    "======================",
    "",
    ...itemLines,
    "======================",
    "",
    `TOTAL : ${formatRupiah(total)}`,
    "",
    `Nama            : ${form.customerName}`,
    `No WhatsApp     : ${form.whatsapp}`,
    `Tanggal Pesan   : ${form.orderDate  ? formatDateID(form.orderDate)  : "-"}`,
    `Tanggal Ambil   : ${form.pickupDate ? formatDateID(form.pickupDate) : "-"}`,
    `Metode          : ${form.method === "diantar" ? "Diantar" : "Ambil di Toko"}`,
    `Kartu Ucapan    : ${form.cardMessage || "-"}`,
    `Catatan         : ${form.note || "-"}`,
    "",
    "Terima kasih 🌸",
  ];
  return lines.join("\n");
}
// CART FEATURE END

export function buildWhatsAppUrl(message: string, phone?: string): string {
  let num = (phone ?? SITE.whatsapp).replace(/[^0-9]/g, "");
  // Normalize Indonesian numbers: 08xxx → 628xxx
  if (num.startsWith("0")) num = "62" + num.slice(1);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function quickEnquiryUrl(productName?: string): string {
  const msg = productName
    ? `Halo Blush Petals.id 🌸\n\nSaya tertarik dengan produk "${productName}". Mohon info lebih lanjut. Terima kasih.`
    : `Halo Blush Petals.id 🌸\n\nSaya ingin bertanya tentang produk dan pemesanan. Terima kasih.`;
  return buildWhatsAppUrl(msg);
}
