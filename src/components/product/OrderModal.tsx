"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import type { OrderForm, Product } from "@/lib/types";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { createOrder } from "@/lib/supabase/orders";
import { BOUQUET_COLORS } from "@/lib/data/bouquet-colors";
import { Send } from "lucide-react";

// ── Compact pill picker used inside the modal ─────────────────────

function ColorPills({
  colors,
  value,
  onChange,
}: {
  colors: { name: string; hex: string }[];
  value: string | undefined;
  onChange: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(c.name)}
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-full border text-xs font-medium transition-all ${
            value === c.name
              ? "border-blush-500 bg-blush-50 text-blush-700 shadow-sm"
              : "border-blush-100 text-ink-600 hover:bg-blush-50 hover:border-blush-200"
          }`}
        >
          <span
            className="h-3 w-3 rounded-full border border-ink-900/10 shrink-0"
            style={{ background: c.hex }}
          />
          {c.name}
        </button>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  initialWrap?: string;
  initialRibbon?: string;
  initialMethod?: OrderForm["method"];
  // CART FEATURE START
  initialQty?: number;
  // CART FEATURE END
}

const today = () => new Date().toISOString().slice(0, 10);

// ── Component ─────────────────────────────────────────────────────

export function OrderModal({
  open,
  onClose,
  product,
  initialWrap,
  initialRibbon,
  initialMethod,
  // CART FEATURE START
  initialQty = 1,
  // CART FEATURE END
}: OrderModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<OrderForm>({
    customerName: "",
    whatsapp: "",
    orderDate: today(),
    pickupDate: today(),
    productName: product.name,
    price: product.price,
    wrappingColor: initialWrap ?? BOUQUET_COLORS[0].name,
    ribbonColor: initialRibbon ?? BOUQUET_COLORS[0].name,
    cardMessage: "",
    note: "",
    method: initialMethod ?? "ambil",
    // CART FEATURE START
    quantity: initialQty,
    // CART FEATURE END
  });

  // Reset form fully every time the modal opens
  React.useEffect(() => {
    if (!open) return;
    setForm({
      customerName: "",
      whatsapp: "",
      orderDate: today(),
      pickupDate: today(),
      productName:   product.name,
      price:         product.price,
      wrappingColor: initialWrap   ?? BOUQUET_COLORS[0].name,
      ribbonColor:   initialRibbon ?? BOUQUET_COLORS[0].name,
      cardMessage: "",
      note: "",
      method: initialMethod ?? "ambil",
      // CART FEATURE START
      quantity: initialQty,
      // CART FEATURE END
    });
  }, [open, product.name, product.price, initialWrap, initialRibbon, initialMethod, initialQty]);

  const update = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      toast.error("Mohon isi nama pemesan.");
      return;
    }
    if (!/^[0-9+\s-]{8,}$/.test(form.whatsapp.trim())) {
      toast.error("Nomor WhatsApp tidak valid.");
      return;
    }

    setSubmitting(true);

    // Build WA URL synchronously — must happen before any await
    const msg = buildOrderMessage({ ...form, price: product.price });
    const url = buildWhatsAppUrl(msg);

    // Open WhatsApp BEFORE any await.
    // Browsers revoke the user-gesture token after the first await, blocking window.open.
    const waWindow = window.open(url, "_blank");
    const wasBlocked = !waWindow || waWindow.closed;

    try {
      await createOrder(form, product);

      // Set flag so the thank-you popup shows when user returns from WA
      localStorage.setItem("blushpetals_wa_sent", Date.now().toString());

      if (wasBlocked) {
        // Popup blocked (rare on mobile) — redirect same tab as fallback
        window.location.href = url;
      }

      onClose();
    } catch (err: unknown) {
      console.error("[OrderModal] Gagal menyimpan pesanan:", err);
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan pesanan. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Pesan ${product.name}`}
      description="Isi data di bawah, pesanan akan dikirim via WhatsApp."
    >
      <form onSubmit={handleSubmit} className="w-full space-y-3.5">

        {/* Identitas */}
        <Field label="Nama Pemesan" required htmlFor="name">
          <Input
            id="name"
            placeholder="Nama lengkap"
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            required
          />
        </Field>

        <Field label="Nomor WhatsApp" required htmlFor="wa">
          <Input
            id="wa"
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            required
          />
        </Field>

        {/*
          Flex-col selalu vertical di mobile.
          Flex-row hanya di desktop (md+) saat modal cukup lebar.
          min-w-0 di setiap wrapper mencegah date input meluap dari container.
        */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full min-w-0">
            <Field label="Tanggal Pesan" required htmlFor="orderDate">
              <Input
                id="orderDate"
                type="date"
                value={form.orderDate}
                onChange={(e) => update("orderDate", e.target.value)}
                required
              />
            </Field>
          </div>
          <div className="w-full min-w-0">
            <Field label="Tgl. Pengambilan" required htmlFor="pickupDate">
              <Input
                id="pickupDate"
                type="date"
                value={form.pickupDate}
                onChange={(e) => update("pickupDate", e.target.value)}
                required
              />
            </Field>
          </div>
        </div>

        <Field label="Jenis / Nama Bunga" required htmlFor="prod">
          <Input
            id="prod"
            value={form.productName}
            onChange={(e) => update("productName", e.target.value)}
            required
          />
        </Field>

        {/* Kustomisasi */}
        <div className="rounded-2xl border border-blush-100 bg-blush-50/30 px-4 py-3.5 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Kustomisasi Bouquet
          </p>

          <Field label="Warna Wrapping">
            <ColorPills
              colors={BOUQUET_COLORS}
              value={form.wrappingColor}
              onChange={(v) => update("wrappingColor", v)}
            />
          </Field>

          <Field label="Pilihan Pita">
            <ColorPills
              colors={BOUQUET_COLORS}
              value={form.ribbonColor}
              onChange={(v) => update("ribbonColor", v)}
            />
          </Field>

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
        </div>

        {/* Pesan & catatan */}
        <Field label="Kartu Ucapan" htmlFor="card">
          <Textarea
            id="card"
            placeholder="Tulis pesan untuk penerima..."
            value={form.cardMessage}
            onChange={(e) => update("cardMessage", e.target.value)}
          />
        </Field>

        <Field label="Catatan Tambahan" htmlFor="note">
          <Textarea
            id="note"
            placeholder="Request tambahan, warna spesifik, dll..."
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
          />
        </Field>

        <div className="pt-2 flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? "Mengirim…" : "Kirim Pesanan via WhatsApp"}
          </Button>

          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
        </div>

      </form>
    </Modal>
  );
}
