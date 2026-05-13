"use client";

import * as React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Product, ProductCategory, StockStatus } from "@/lib/types";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

interface Props {
  initial?: Product | null;
  onSaved: (p: Product) => void;
  onCancel: () => void;
}

const DEFAULT: Omit<Product, "id"> = {
  name: "",
  slug: "",
  category: "artificial-bouquet",
  price: 0,
  description: "",
  image: "",
  badge: "",
  stock_status: "tersedia",
};

export function ProductForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = React.useState<Product>(() => ({
    id: initial?.id ?? "",
    ...DEFAULT,
    ...(initial ?? {}),
  }));
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>(initial?.image ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = <K extends keyof Product>(key: K, value: Product[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase belum terkonfigurasi");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    setSaving(true);
    const t = toast.loading(initial ? "Memperbarui produk..." : "Menambahkan produk...");
    try {
      let imageUrl = form.image;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${slugify(form.name)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        slug: (form.slug || slugify(form.name)).trim(),
        category: form.category,
        price: Number(form.price) || 0,
        description: form.description ?? "",
        image: imageUrl,
        badge: form.badge || null,
        stock_status: form.stock_status,
      };

      if (initial?.id) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initial.id)
          .select()
          .single();
        if (error) throw error;
        toast.success("Produk diperbarui", { id: t });
        onSaved(data as Product);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        toast.success("Produk ditambahkan", { id: t });
        onSaved(data as Product);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan", { id: t });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="text-xs font-medium text-ink-700 mb-2">Foto Produk</p>
        <label className="relative flex items-center justify-center aspect-[4/3] rounded-3xl border border-dashed border-blush-200 bg-blush-50/50 overflow-hidden cursor-pointer hover:bg-blush-50 transition">
          {preview ? (
            <>
              <Image src={preview} alt="Preview" fill sizes="(max-width: 768px) 90vw, 480px" className="object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                  setPreview("");
                  update("image", "");
                }}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-ink-700 hover:text-blush-600 shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="text-center text-ink-500">
              <ImagePlus className="h-6 w-6 mx-auto mb-2 text-blush-500" />
              <p className="text-sm">Klik untuk pilih gambar</p>
              <p className="text-[11px] mt-1 text-ink-400">PNG, JPG hingga 5MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Harga (IDR)" required>
          <Input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            required
          />
        </Field>
        <Field label="Kategori" required>
          <Select
            value={form.category}
            onChange={(e) => update("category", e.target.value as ProductCategory)}
          >
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status Stok" required>
          <Select
            value={form.stock_status}
            onChange={(e) => update("stock_status", e.target.value as StockStatus)}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Badge (opsional)" hint="Contoh: Best Seller, Fresh Daily, Limited">
        <Input
          value={form.badge ?? ""}
          onChange={(e) => update("badge", e.target.value)}
          placeholder="Best Seller"
        />
      </Field>

      <Field label="Deskripsi">
        <Textarea
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Menyimpan..." : initial ? "Update Produk" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}
