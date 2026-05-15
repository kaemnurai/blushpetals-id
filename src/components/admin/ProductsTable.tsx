"use client";

import * as React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Loader2,
  LayoutGrid,
  List,
  Crown,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "./ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type Product,
  type ProductCategory,
  type StockStatus,
} from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { rowToProduct } from "@/lib/supabase/queries";
import { formatRupiah, cn } from "@/lib/utils";
import { revalidateProductPages } from "@/app/actions";

// ── Constants ─────────────────────────────────────────────────────

const PAGE_SIZE = 9;

type FilterType = "all" | ProductCategory | StockStatus | "hero" | "featured";

const FILTER_CHIPS: { label: string; value: FilterType }[] = [
  { label: "Semua", value: "all" },
  { label: "Artificial", value: "artificial-bouquet" },
  { label: "Premium", value: "premium-collection" },
  { label: "Fresh Flower", value: "fresh-flower" },
  { label: "Tersedia", value: "tersedia" },
  { label: "Pre-order", value: "preorder" },
  { label: "Sold Out", value: "sold-out" },
  { label: "Hero", value: "hero" },
  { label: "Featured", value: "featured" },
];

type ViewMode = "grid" | "list";

// ── Supabase fetch — only the requested page ──────────────────────
// Applies filter chip + full-text search (server-side ilike) then
// paginates with range(). Never fetches the entire table.

async function fetchPage(
  filter: FilterType,
  page: number,
  search: string,
): Promise<{ products: Product[]; count: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { products: [], count: 0 };

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Category / stock / flag filter
  if (
    filter === "artificial-bouquet" ||
    filter === "premium-collection" ||
    filter === "fresh-flower"
  ) {
    q = q.eq("category", filter);
  } else if (
    filter === "tersedia" ||
    filter === "preorder" ||
    filter === "sold-out"
  ) {
    q = q.eq("stock_status", filter);
  } else if (filter === "hero") {
    q = q.eq("is_hero_product", true);
  } else if (filter === "featured") {
    q = q.eq("is_featured_home", true);
  }

  // Server-side text search: matches title (= name) or slug
  const term = search.trim();
  if (term) {
    q = q.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  return {
    products: ((data ?? []) as Record<string, unknown>[]).map(rowToProduct),
    count: count ?? 0,
  };
}

// ── Pagination range helper ───────────────────────────────────────
// Returns the page indices (0-based) and "…" sentinels to render.

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationRange(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const showLeft = current > 3;
  const showRight = current < total - 4;

  if (!showLeft && showRight) {
    return [...Array.from({ length: 5 }, (_, i) => i), "ellipsis-end", total - 1];
  }
  if (showLeft && !showRight) {
    return [0, "ellipsis-start", ...Array.from({ length: 5 }, (_, i) => total - 5 + i)];
  }
  if (showLeft && showRight) {
    return [0, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total - 1];
  }
  return Array.from({ length: total }, (_, i) => i);
}

// ── Pagination controls ───────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(currentPage, totalPages);
  const btnBase =
    "inline-flex items-center justify-center h-9 min-w-[2.25rem] px-2.5 rounded-xl text-xs font-medium transition select-none";

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      {/* ← Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
        className={cn(
          btnBase,
          "gap-1 px-3 border border-blush-100 bg-white text-ink-600",
          "hover:border-blush-300 hover:text-blush-700",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-blush-100 disabled:hover:text-ink-600",
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      {pages.map((item, idx) =>
        item === "ellipsis-start" || item === "ellipsis-end" ? (
          <span
            key={item}
            className="h-9 min-w-[2.25rem] flex items-center justify-center text-xs text-ink-400"
          >
            …
          </span>
        ) : (
          <button
            key={`page-${item}`}
            onClick={() => onPageChange(item)}
            disabled={loading}
            className={cn(
              btnBase,
              item === currentPage
                ? "bg-gradient-to-br from-blush-400 to-blush-600 text-white shadow-sm"
                : "border border-blush-100 bg-white text-ink-600 hover:border-blush-300 hover:text-blush-700",
              "disabled:cursor-not-allowed",
            )}
          >
            {item + 1}
          </button>
        ),
      )}

      {/* Next → */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1 || loading}
        className={cn(
          btnBase,
          "gap-1 px-3 border border-blush-100 bg-white text-ink-600",
          "hover:border-blush-300 hover:text-blush-700",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-blush-100 disabled:hover:text-ink-600",
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Flag badges ───────────────────────────────────────────────────

function ProductFlags({ product: p }: { product: Product }) {
  if (!p.is_hero_product && !p.is_featured_home) return null;
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {p.is_hero_product && (
        <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">
          <Crown className="h-2.5 w-2.5" /> Hero
        </span>
      )}
      {p.is_featured_home && (
        <span className="inline-flex items-center gap-0.5 text-[9px] bg-blush-50 text-blush-600 border border-blush-100 px-1.5 py-0.5 rounded-full font-medium">
          <Star className="h-2.5 w-2.5" /> Featured
        </span>
      )}
    </div>
  );
}

// ── Grid card ─────────────────────────────────────────────────────

function GridCard({
  product: p,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="rounded-3xl bg-white border border-blush-100/60 overflow-hidden shadow-card flex">
      <div className="relative h-32 w-32 flex-shrink-0 bg-cream-50">
        {p.image ? (
          <Image src={p.image} alt={p.name ?? ""} fill sizes="128px" className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-ink-400">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-serif text-sm text-ink-900 truncate">{p.name ?? "—"}</p>
            <p className="text-[11px] text-ink-500 mt-0.5">{CATEGORY_LABEL[p.category] ?? ""}</p>
          </div>
          <Badge
            variant={
              p.stock_status === "tersedia"
                ? "default"
                : p.stock_status === "preorder"
                ? "outline"
                : "dark"
            }
            className="flex-shrink-0"
          >
            {STATUS_LABEL[p.stock_status] ?? ""}
          </Badge>
        </div>
        <p className="text-blush-600 text-sm font-medium mt-1.5">{formatRupiah(p.price)}</p>
        {(p.capital_price ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] text-amber-600">Modal: {formatRupiah(p.capital_price!)}</span>
            <span className="text-[10px] text-ink-300">·</span>
            <span className="text-[10px] text-emerald-600">
              Profit: {formatRupiah(p.price - p.capital_price!)}
            </span>
          </div>
        )}
        <ProductFlags product={p} />
        <div className="mt-auto pt-2 flex gap-2">
          <button
            onClick={() => onEdit(p)}
            className="flex-1 inline-flex items-center justify-center gap-1 h-8 px-3 rounded-full text-xs bg-blush-50 text-blush-700 hover:bg-blush-100 transition"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(p)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
            aria-label="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── List row ──────────────────────────────────────────────────────

function ListRow({
  product: p,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-blush-100/60 shadow-sm flex items-center gap-3 p-3">
      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-cream-50">
        {p.image ? (
          <Image src={p.image} alt={p.name ?? ""} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] text-ink-400">
            —
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-serif text-sm text-ink-900">{p.name ?? "—"}</p>
          {p.is_hero_product && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">
              <Crown className="h-2.5 w-2.5" /> Hero
            </span>
          )}
          {p.is_featured_home && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-blush-50 text-blush-600 border border-blush-100 px-1.5 py-0.5 rounded-full font-medium">
              <Star className="h-2.5 w-2.5" /> Featured
            </span>
          )}
        </div>
        <p className="text-[11px] text-ink-500 mt-0.5 flex flex-wrap items-center gap-1">
          {CATEGORY_LABEL[p.category] ?? ""}
          <span className="text-ink-300">·</span>
          <span className="text-blush-600 font-medium">{formatRupiah(p.price)}</span>
          {(p.capital_price ?? 0) > 0 && (
            <>
              <span className="text-ink-300">·</span>
              <span className="text-amber-600">Modal {formatRupiah(p.capital_price!)}</span>
              <span className="text-ink-300">·</span>
              <span className="text-emerald-600">Profit {formatRupiah(p.price - p.capital_price!)}</span>
            </>
          )}
        </p>
      </div>
      <Badge
        variant={
          p.stock_status === "tersedia"
            ? "default"
            : p.stock_status === "preorder"
            ? "outline"
            : "dark"
        }
        className="flex-shrink-0 hidden sm:inline-flex"
      >
        {STATUS_LABEL[p.stock_status] ?? ""}
      </Badge>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(p)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-blush-50 text-blush-700 hover:bg-blush-100 transition"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(p)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
          aria-label="Hapus"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function ProductsTable() {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);

  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  const [editing, setEditing] = React.useState<Product | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Debounce search input — 350 ms avoids a fetch on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // Stable fetch helper — receives all params explicitly so it never captures stale state
  const load = React.useCallback(
    async (page: number, filter: FilterType, search: string) => {
      setLoading(true);
      try {
        const { products, count } = await fetchPage(filter, page, search);
        setItems(products);
        setTotalCount(count);
        setCurrentPage(page);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Reset to page 1 whenever filter or debounced search changes
  React.useEffect(() => {
    load(0, activeFilter, debouncedQ);
  }, [activeFilter, debouncedQ, load]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const goToPage = (page: number) => {
    if (page === currentPage || loading) return;
    load(page, activeFilter, debouncedQ);
  };

  // Range label: "1–9 dari 45 produk"
  const rangeStart = totalCount === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(rangeStart + PAGE_SIZE - 1, totalCount);

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
    setDeleting(null);
    revalidateProductPages().catch(() => {});

    // If deleting the last item on a non-first page, go back one page
    const newTotal = Math.max(0, totalCount - 1);
    const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const targetPage = Math.min(currentPage, newTotalPages - 1);
    load(targetPage, activeFilter, debouncedQ);
  };

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex rounded-xl border border-blush-100 overflow-hidden bg-white">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={cn(
                "h-9 w-9 flex items-center justify-center transition",
                viewMode === "grid"
                  ? "bg-blush-100 text-blush-700"
                  : "text-ink-400 hover:bg-blush-50",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={cn(
                "h-9 w-9 flex items-center justify-center border-l border-blush-100 transition",
                viewMode === "list"
                  ? "bg-blush-100 text-blush-700"
                  : "text-ink-400 hover:bg-blush-50",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* ── Filter chips ─────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => {
              setActiveFilter(chip.value);
              setQ("");
            }}
            className={cn(
              "flex-shrink-0 px-3.5 h-8 rounded-full text-xs font-medium transition",
              activeFilter === chip.value
                ? "bg-blush-500 text-white shadow-sm"
                : "bg-white border border-blush-100 text-ink-600 hover:border-blush-300 hover:text-blush-700",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Count / range line ───────────────────────────────────── */}
      {!loading && (
        <p className="text-xs text-ink-400 mb-3">
          {debouncedQ
            ? `${totalCount} hasil untuk "${debouncedQ}"`
            : totalCount === 0
            ? "Tidak ada produk"
            : `${rangeStart}–${rangeEnd} dari ${totalCount} produk`}
        </p>
      )}

      {/* ── Grid / List ──────────────────────────────────────────── */}
      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              : "space-y-2"
          }
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === "grid" ? "h-36 rounded-3xl" : "h-[72px] rounded-2xl"}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl bg-white border border-blush-100 p-10 text-center">
          <p className="font-serif text-xl text-ink-900 mb-1">Tidak ada produk</p>
          <p className="text-sm text-ink-500">
            {debouncedQ
              ? "Coba kata kunci berbeda."
              : activeFilter !== "all"
              ? "Tidak ada produk dengan filter ini."
              : 'Klik "Tambah Produk" untuk mulai menambahkan.'}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <GridCard key={p.id} product={p} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <ListRow key={p.id} product={p} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          loading={loading}
        />
      )}

      {/* ── Modals ───────────────────────────────────────────────── */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah Produk">
        <ProductForm
          onSaved={() => {
            setCreating(false);
            revalidateProductPages().catch(() => {});
            // New product is newest — go to page 1 to see it
            load(0, activeFilter, debouncedQ);
          }}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Produk">
        {editing && (
          <ProductForm
            initial={editing}
            onSaved={(saved) => {
              setEditing(null);
              // Immediately update this product in the list (instant feedback)
              setItems((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
              // Then hard-refetch the page from DB (ensures DB sync)
              revalidateProductPages().catch(() => {});
              load(currentPage, activeFilter, debouncedQ);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Hapus Produk?"
        description={`Produk "${deleting?.name ?? "ini"}" akan dihapus permanen.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Batal
          </Button>
          <Button
            onClick={onDelete}
            disabled={busy}
            className="bg-red-500 hover:bg-red-600 from-red-500 to-red-600 bg-gradient-to-br"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
