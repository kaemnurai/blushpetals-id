"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import type { OrderForm, Product } from "@/lib/types";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { Send } from "lucide-react";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

const today = () => new Date().toISOString().slice(0, 10);

export function OrderModal({ open, onClose, product }: OrderModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<OrderForm>({
    customerName: "",
    whatsapp: "",
    orderDate: today(),
    pickupDate: today(),
    productName: product.name,
    wrappingColor: "",
    cardMessage: "",
    note: "",
    method: "ambil",
  });

  React.useEffect(() => {
    setForm((f) => ({ ...f, productName: product.name }));
  }, [product.name]);

  const update = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    const msg = buildOrderMessage(form);
    const url = buildWhatsAppUrl(msg);
    setTimeout(() => {
      window.open(url, "_blank");
      setSubmitting(false);
      toast.success("Mengarahkan ke WhatsApp…");
      onClose();
    }, 350);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Pesan ${product.name}`}
      description="Isi data di bawah, pesanan akan dikirim via WhatsApp."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal Pesan" required htmlFor="orderDate">
            <Input
              id="orderDate"
              type="date"
              value={form.orderDate}
              onChange={(e) => update("orderDate", e.target.value)}
              required
            />
          </Field>
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

        <Field label="Jenis / Nama Bunga" required htmlFor="prod">
          <Input
            id="prod"
            value={form.productName}
            onChange={(e) => update("productName", e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Warna Wrapping" htmlFor="wrap">
            <Input
              id="wrap"
              placeholder="Contoh: Soft Pink"
              value={form.wrappingColor}
              onChange={(e) => update("wrappingColor", e.target.value)}
            />
          </Field>
          <Field label="Metode" htmlFor="method">
            <Select
              id="method"
              value={form.method}
              onChange={(e) => update("method", e.target.value as OrderForm["method"])}
            >
              <option value="ambil">Ambil ke store</option>
              <option value="gosend">GoSend</option>
            </Select>
          </Field>
        </div>

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
            placeholder="Request tambahan..."
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
