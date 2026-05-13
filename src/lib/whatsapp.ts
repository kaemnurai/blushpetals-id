import { SITE } from "@/lib/data/site";
import type { OrderForm } from "@/lib/types";
import { formatDateID } from "@/lib/utils";

export function buildOrderMessage(form: OrderForm): string {
  const lines = [
    "Halo Blush Petals.id 🌸",
    "",
    "Saya ingin memesan bouquet:",
    "",
    `Nama: ${form.customerName}`,
    `No WhatsApp: ${form.whatsapp}`,
    `Produk: ${form.productName}`,
    `Tanggal Pesan: ${form.orderDate ? formatDateID(form.orderDate) : "-"}`,
    `Tanggal Ambil: ${form.pickupDate ? formatDateID(form.pickupDate) : "-"}`,
    `Warna Wrapping: ${form.wrappingColor || "-"}`,
    `Metode Pengambilan: ${form.method === "ambil" ? "Ambil ke store" : "GoSend"}`,
    `Kartu Ucapan: ${form.cardMessage || "-"}`,
    `Catatan: ${form.note || "-"}`,
    "",
    "Terima kasih.",
  ];
  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string, phone?: string): string {
  const num = (phone ?? SITE.whatsapp).replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function quickEnquiryUrl(productName?: string): string {
  const msg = productName
    ? `Halo Blush Petals.id 🌸\n\nSaya tertarik dengan produk "${productName}". Mohon info lebih lanjut. Terima kasih.`
    : `Halo Blush Petals.id 🌸\n\nSaya ingin bertanya tentang produk dan pemesanan. Terima kasih.`;
  return buildWhatsAppUrl(msg);
}
