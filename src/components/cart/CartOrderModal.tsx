// CART FEATURE START
"use client";

import * as React from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import type { CartItem, CartOrderForm } from "@/lib/types";
import { buildCartOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { createCartOrder } from "@/lib/supabase/orders";
import { formatRupiah } from "@/lib/utils";

interface CartOrderModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function CartOrderModal({
  open,
  onClose,
  items,
  totalPrice,
  onSuccess,
}: CartOrderModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<CartOrderForm>({
    customerName: "",
    whatsapp: "",
    orderDate: today(),
    pickupDate: today(),
    cardMessage: "",
    note: "",
    method: "ambil",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      customerName: "",
      whatsapp: "",
      orderDate: today(),
      pickupDate: today(),
      cardMessage: "",
      note: "",
      method: "ambil",
    });
  }, [open]);

  const update = <K extends keyof CartOrderForm>(key: K, value: CartOrderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error("Mohon isi nama pemesan."); return; }
    if (!/^[0-9+\s-]{8,}$/.test(form.whatsapp.trim())) {
      toast.error("Nomor WhatsApp tidak valid."); return;
    }

    setSubmitting(true);

    const msg = buildCartOrderMessage(form, items);
    const url = buildWhatsAppUrl(msg);
    const waWindow = window.open(url, "_blank");
    const wasBlocked = !waWindow || waWindow.closed;

    try {
      await createCartOrder(form, items);
      localStorage.setItem("blushpetals_wa_sent", Date.now().toString());
      if (wasBlocked) window.location.href = url;
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pesanan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi Pesanan"
      description="Periksa daftar pesanan, lalu isi data pengiriman."
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Item summary ── */}
        <div className="rounded-2xl border border-blush-100 bg-blush-50/30 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-blush-100/60 bg-blush-50/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Daftar Pesanan
            </p>
          </div>
          <div className="divide-y divide-blush-100/60">
            {items.map((item) => (
              <div key={item.cartId} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-cream-50 shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-ink-400">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{item.productName}</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    {item.wrapping && <span>Wrapping: {item.wrapping}</span>}
                    {item.wrapping && item.ribbon && <span className="mx-1 text-ink-300">·</span>}
                    {item.ribbon && <span>Pita: {item.ribbon}</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink-500">× {item.quantity}</p>
                  <p className="text-sm font-semibold text-blush-600">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-blush-50/60 border-t border-blush-100/60 flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-700">Total</p>
            <p className="font-serif text-base font-semibold text-blush-600">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>

        {/* ── Customer info ── */}
        <Field label="Nama Pemesan" required htmlFor="cart-name">
          <Input
            id="cart-name"
            placeholder="Nama lengkap"
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            required
          />
        </Field>

        <Field label="Nomor WhatsApp" required htmlFor="cart-wa">
          <Input
            id="cart-wa"
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            required
          />
        </Field>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full min-w-0">
            <Field label="Tanggal Pesan" required htmlFor="cart-order-date">
              <Input
                id="cart-order-date"
                type="date"
                value={form.orderDate}
                onChange={(e) => update("orderDate", e.target.value)}
                required
              />
            </Field>
          </div>
          <div className="w-full min-w-0">
            <Field label="Tgl. Pengambilan" required htmlFor="cart-pickup-date">
              <Input
                id="cart-pickup-date"
                type="date"
                value={form.pickupDate}
                onChange={(e) => update("pickupDate", e.target.value)}
                required
              />
            </Field>
          </div>
        </div>

        <Field label="Metode Pesanan">
          <div className="flex rounded-2xl border border-blush-100 bg-white/60 p-1 gap-1">
            {([
              { value: "diantar", label: "Diantar" },
              { value: "ambil",   label: "Ambil di Toko" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update("method", value)}
                className={`flex-1 h-9 rounded-xl text-xs font-medium transition-all ${
                  form.method === value
                    ? "bg-blush-500 text-white shadow-sm"
                    : "text-ink-500 hover:text-ink-700 hover:bg-blush-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Kartu Ucapan" htmlFor="cart-card">
          <Textarea
            id="cart-card"
            placeholder="Tulis pesan untuk penerima..."
            value={form.cardMessage}
            onChange={(e) => update("cardMessage", e.target.value)}
          />
        </Field>

        <Field label="Catatan Tambahan" htmlFor="cart-note">
          <Textarea
            id="cart-note"
            placeholder="Request tambahan, dll..."
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
          />
        </Field>

        <div className="pt-2 flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? "Mengirim…" : "Kirim Pesanan via WhatsApp"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
        </div>
      </form>
    </Modal>
  );
}
// CART FEATURE END
