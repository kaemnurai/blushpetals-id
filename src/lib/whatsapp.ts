import { SITE } from "@/lib/data/site";
import type { OrderForm } from "@/lib/types";
import { formatDateID } from "@/lib/utils";

export function buildOrderMessage(form: OrderForm, orderId?: string): string {
  const ref = orderId ? `#${orderId.slice(-6).toUpperCase()}` : null;
  const lines = [
    "Halo Blush Petals.id 🌸",
    "",
    "Saya ingin memesan bouquet:",
    ...(ref ? [`ID Pesanan: ${ref}`, ""] : [""]),
    `Nama          : ${form.customerName}`,
    `No WhatsApp   : ${form.whatsapp}`,
    `Produk        : ${form.productName}`,
    `Tanggal Pesan : ${form.orderDate  ? formatDateID(form.orderDate)  : "-"}`,
    `Tanggal Ambil : ${form.pickupDate ? formatDateID(form.pickupDate) : "-"}`,
    `Warna Wrapping: ${form.wrappingColor || "-"}`,
    `Pita          : ${form.ribbonColor || "-"}`,
    `Metode        : ${form.method === "diantar" ? "Diantar" : "Ambil di Toko"}`,
    `Kartu Ucapan  : ${form.cardMessage || "-"}`,
    `Catatan       : ${form.note || "-"}`,
    "",
    "Terima kasih. 🌸",
  ];
  return lines.join("\n");
}

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
