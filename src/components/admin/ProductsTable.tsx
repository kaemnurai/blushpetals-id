"use client";

import * as React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "./ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { CATEGORY_LABEL, STATUS_LABEL, type Product } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRupiah, cn } from "@/lib/utils";

export function ProductsTable() {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((data as Product[]) ?? []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return items;
    const k = q.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        p.slug.toLowerCase().includes(k) ||
        CATEGORY_LABEL[p.category].toLowerCase().includes(k),
    );
  }, [q, items]);

  const onDelete = async () => {
    if (!deleting) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    const t = toast.loading("Menghapus produk...");
    const { error } = await supabase.from("products").delete().eq("id", deleting.id);
    setBusy(false);
    if (error) {
      toast.error(error.message, { id: t });
      return;
    }
    toast.success("Produk dihapus", { id: t });
    setItems((s) => s.filter((p) => p.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk..."
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-blush-100 p-10 text-center text-ink-500">
          <p className="font-serif text-xl text-ink-900 mb-1">Belum ada produk</p>
          <p className="text-sm">Klik "Tambah Produk" untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-white border border-blush-100/60 overflow-hidden shadow-card flex"
            >
              <div className="relative h-32 w-32 flex-shrink-0 bg-cream-50">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-ink-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-ink-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-500">{CATEGORY_LABEL[p.category]}</p>
                  </div>
                  <Badge variant={p.stock_status === "tersedia" ? "default" : p.stock_status === "preorder" ? "outline" : "dark"} className={cn("flex-shrink-0")}>
                    {STATUS_LABEL[p.stock_status]}
                  </Badge>
                </div>
                <p className="text-blush-600 text-sm font-medium mt-1.5">
                  {formatRupiah(p.price)}
                </p>
                <div className="mt-auto pt-2 flex gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1 h-8 px-3 rounded-full text-xs bg-blush-50 text-blush-700 hover:bg-blush-100 transition"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah Produk">
        <ProductForm
          onSaved={(p) => {
            setItems((s) => [p, ...s]);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Produk">
        {editing && (
          <ProductForm
            initial={editing}
            onSaved={(p) => {
              setItems((s) => s.map((x) => (x.id === p.id ? p : x)));
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Hapus Produk?"
        description={`Produk "${deleting?.name}" akan dihapus permanen.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button onClick={onDelete} disabled={busy} className="bg-red-500 hover:bg-red-600 from-red-500 to-red-600 bg-gradient-to-br">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
