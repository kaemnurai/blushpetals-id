"use client";

import * as React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Product, ProductCategory, StockStatus, ProductStatus } from "@/lib/types";
import { CATEGORY_LABEL, STATUS_LABEL, PRODUCT_STATUS_LABEL } from "@/lib/types";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminGetProductImages,
  type ProductPayload,
  type ImageSlotInput,
} from "@/lib/supabase/admin";
import { cn, slugify } from "@/lib/utils";

interface Props {
  initial?: Product | null;
  onSaved: (p: Product) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  description: string;
  badge: string;
  stock_status: StockStatus;
  status: ProductStatus;
  is_hero_product: boolean;
  is_featured_home: boolean;
}

const EMPTY: FormState = {
  name:             "",
  slug:             "",
  category:         "artificial-bouquet",
  price:            0,
  description:      "",
  badge:            "",
  stock_status:     "tersedia",
  status:           "available",
  is_hero_product:  false,
  is_featured_home: false,
};

// ── Image slot ────────────────────────────────────────────────────

interface SlotState {
  existingUrl: string; // URL already in DB; "" = none
  newFile: File | null;
  preview: string;     // blob URL for newFile, or existingUrl
}

const emptySlot = (): SlotState => ({ existingUrl: "", newFile: null, preview: "" });

type Slots = [SlotState, SlotState, SlotState];

const SLOT_LABELS = ["Gambar 1", "Gambar 2", "Gambar 3"] as const;

// ── Component ─────────────────────────────────────────────────────

export function ProductForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = React.useState<FormState>(() => ({
    ...EMPTY,
    name:             initial?.name ?? "",
    slug:             initial?.slug ?? "",
    category:         initial?.category ?? "artificial-bouquet",
    price:            initial?.price ?? 0,
    description:      initial?.description ?? "",
    badge:            initial?.badge ?? "",
    stock_status:     initial?.stock_status ?? "tersedia",
    status:           initial?.status ?? "available",
    is_hero_product:  initial?.is_hero_product ?? false,
    is_featured_home: initial?.is_featured_home ?? false,
  }));

  // Slot 0 is seeded from initial.image immediately (before async load)
  const [slots, setSlots] = React.useState<Slots>(() => {
    const s0 = emptySlot();
    if (initial?.image) { s0.existingUrl = initial.image; s0.preview = initial.image; }
    return [s0, emptySlot(), emptySlot()];
  });

  const [saving, setSaving] = React.useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Load existing product_images into slots on edit
  React.useEffect(() => {
    if (!initial?.id) return;
    adminGetProductImages(initial.id).then((imgs) => {
      setSlots([
        {
          existingUrl: imgs[0]?.image_url ?? (initial?.image ?? ""),
          newFile:     null,
          preview:     imgs[0]?.image_url ?? (initial?.image ?? ""),
        },
        {
          existingUrl: imgs[1]?.image_url ?? "",
          newFile:     null,
          preview:     imgs[1]?.image_url ?? "",
        },
        {
          existingUrl: imgs[2]?.image_url ?? "",
          newFile:     null,
          preview:     imgs[2]?.image_url ?? "",
        },
      ]);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  // Revoke any blob URLs on unmount
  React.useEffect(() => {
    return () => {
      slots.forEach((s) => {
        if (s.preview.startsWith("blob:")) URL.revokeObjectURL(s.preview);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (i: number, file: File | null) => {
    if (!file) return;
    setSlots((prev) => {
      const next = [...prev] as Slots;
      if (next[i].preview.startsWith("blob:")) URL.revokeObjectURL(next[i].preview);
      next[i] = { ...next[i], newFile: file, preview: URL.createObjectURL(file) };
      return next;
    });
  };

  const clearSlot = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    setSlots((prev) => {
      const next = [...prev] as Slots;
      if (next[i].preview.startsWith("blob:")) URL.revokeObjectURL(next[i].preview);
      next[i] = emptySlot();
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nama produk wajib diisi"); return; }

    setSaving(true);
    const t = toast.loading(initial ? "Memperbarui produk..." : "Menambahkan produk...");

    const payload: ProductPayload = {
      name:             form.name.trim(),
      slug:             form.slug.trim() || undefined,
      description:      form.description,
      price:            Number(form.price) || 0,
      category:         form.category,
      status:           form.status,
      stock_status:     form.stock_status,
      badge:            form.badge || null,
      is_hero_product:  form.is_hero_product,
      is_featured_home: form.is_featured_home,
    };

    const imageSlots: ImageSlotInput[] = slots.map((s) => ({
      existingUrl: s.existingUrl,
      newFile:     s.newFile,
    }));

    try {
      let saved: Product;
      if (initial?.id) {
        saved = await adminUpdateProduct(initial.id, payload, imageSlots);
      } else {
        saved = await adminCreateProduct(payload, imageSlots);
      }
      toast.success(initial ? "Produk diperbarui" : "Produk ditambahkan", { id: t });
      onSaved(saved);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan", { id: t });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">

      {/* ── Image slots ── */}
      <div>
        <p className="text-xs font-medium text-ink-700 mb-1">Foto Produk</p>
        <p className="text-[11px] text-ink-400 mb-3">
          Maks. 3 gambar · Gambar 1 menjadi foto utama
        </p>

        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="relative flex flex-col items-center justify-center aspect-square rounded-2xl border border-dashed border-blush-200 bg-blush-50/50 overflow-hidden cursor-pointer hover:bg-blush-50 transition group">
                {slot.preview ? (
                  <>
                    <Image
                      src={slot.preview}
                      alt={SLOT_LABELS[i]}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => clearSlot(i, e)}
                      className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-ink-600 hover:text-blush-600 shadow opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-ink-400 px-2">
                    <ImagePlus className="h-5 w-5 mx-auto mb-1.5 text-blush-400" />
                    <p className="text-[10px] leading-tight">Pilih gambar</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileSelect(i, e.target.files?.[0] ?? null)}
                />
              </label>
              <div className="text-center">
                <p className="text-[11px] font-medium text-ink-700">{SLOT_LABELS[i]}</p>
                {i === 0 && <p className="text-[10px] text-blush-500">Foto utama</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Name + slug ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Nama Produk" required>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </Field>
        <Field label="Slug" hint="Otomatis dari nama jika kosong">
          <Input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder={slugify(form.name) || "auto"}
          />
        </Field>
      </div>

      {/* ── Price + category + stock ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Harga (IDR)" required>
          <Input
            type="number" min={0} value={form.price}
            onChange={(e) => update("price", Number(e.target.value))} required
          />
        </Field>
        <Field label="Kategori" required>
          <Select value={form.category} onChange={(e) => update("category", e.target.value as ProductCategory)}>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Stok" required>
          <Select value={form.stock_status} onChange={(e) => update("stock_status", e.target.value as StockStatus)}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
      </div>

      {/* ── Visibility + badge ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Visibilitas Produk">
          <Select value={form.status} onChange={(e) => update("status", e.target.value as ProductStatus)}>
            {Object.entries(PRODUCT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Badge" hint="Contoh: Best Seller, Fresh Daily">
          <Input value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="Best Seller" />
        </Field>
      </div>

      {/* ── Homepage placement ── */}
      <div className="rounded-2xl border border-blush-100 p-4 space-y-3 bg-blush-50/30">
        <p className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Tampilan Homepage</p>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={cn(
            "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition",
            form.is_hero_product ? "border-blush-500 bg-blush-500" : "border-blush-200 group-hover:border-blush-400",
          )}>
            {form.is_hero_product && <span className="block h-2 w-2 rounded-full bg-white" />}
          </div>
          <input
            type="checkbox" className="sr-only"
            checked={form.is_hero_product}
            onChange={(e) => update("is_hero_product", e.target.checked)}
          />
          <div>
            <p className="text-sm font-medium text-ink-900">Hero Product</p>
            <p className="text-[11px] text-ink-400 mt-0.5">Produk ini tampil di bagian Hero (hanya 1 produk).</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={cn(
            "mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition",
            form.is_featured_home ? "border-blush-500 bg-blush-500" : "border-blush-200 group-hover:border-blush-400",
          )}>
            {form.is_featured_home && (
              <span className="block h-2.5 w-2.5 text-white">
                <svg viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          <input
            type="checkbox" className="sr-only"
            checked={form.is_featured_home}
            onChange={(e) => update("is_featured_home", e.target.checked)}
          />
          <div>
            <p className="text-sm font-medium text-ink-900">Featured Homepage</p>
            <p className="text-[11px] text-ink-400 mt-0.5">Muncul di section &ldquo;Produk Unggulan&rdquo; (maks. 4 produk).</p>
          </div>
        </label>
      </div>

      {/* ── Description ── */}
      <Field label="Deskripsi">
        <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} />
      </Field>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Menyimpan..." : initial ? "Update Produk" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}
