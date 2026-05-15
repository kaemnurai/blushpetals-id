"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type Product,
  type ProductCategory,
} from "@/lib/types";
import { cn, formatRupiah } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────

const TABS: { key: "all" | ProductCategory; label: string; emoji: string }[] = [
  { key: "all", label: "Semua", emoji: "✿" },
  { key: "artificial-bouquet", label: CATEGORY_LABEL["artificial-bouquet"], emoji: "🎀" },
  { key: "premium-collection", label: CATEGORY_LABEL["premium-collection"], emoji: "✨" },
  { key: "fresh-flower", label: CATEGORY_LABEL["fresh-flower"], emoji: "🌸" },
  { key: "custom", label: CATEGORY_LABEL["custom"], emoji: "🎨" },
];

const PER_PAGE = 9;

type ViewMode = "grid" | "list";

// ── List-view card ─────────────────────────────────────────────────
// Compact horizontal card: image left, details right.
// Reuses the same design tokens (rounded-3xl, shadow-card, blush palette)
// as the existing ProductCard — does not alter grid view in any way.

function ProductListCard({ product }: { product: Product }) {
  const soldOut = product.stock_status === "sold-out";

  return (
    <div
      className={cn(
        "group flex gap-3 md:gap-4 rounded-3xl bg-white border border-blush-100/60 shadow-card hover:shadow-premium overflow-hidden transition-shadow duration-300",
        soldOut && "opacity-80",
      )}
    >
      {/* Thumbnail */}
      <Link
        href={`/produk/${product.slug}`}
        className="relative w-28 md:w-36 shrink-0 overflow-hidden bg-cream-50"
        aria-label={product.name}
        tabIndex={-1}
      >
        <div className="aspect-square w-full h-full">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 112px, 144px"
            className={cn(
              "object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]",
              soldOut && "grayscale",
            )}
          />
        </div>
        {product.badge && (
          <div className="absolute top-2 left-2 z-[2] pointer-events-none">
            <Badge variant="blush">{product.badge}</Badge>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col justify-between py-3 pr-3 md:py-4 md:pr-4 flex-1 min-w-0">
        <div>
          {product.stock_status !== "tersedia" && (
            <div className="mb-1.5">
              <Badge variant={soldOut ? "dark" : "cream"}>
                {STATUS_LABEL[product.stock_status]}
              </Badge>
            </div>
          )}
          <Link href={`/produk/${product.slug}`}>
            <h3 className="font-serif text-[15px] md:text-base text-ink-900 leading-snug line-clamp-1 group-hover:text-blush-700 transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
          <p className="text-blush-600 font-semibold text-sm mt-0.5">
            {formatRupiah(product.price)}
          </p>
          {product.description && (
            <p className="text-ink-400 text-[12px] mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
              {product.description}
            </p>
          )}
        </div>
        <Link
          href={`/produk/${product.slug}`}
          className="mt-3 inline-flex w-fit items-center gap-1 h-9 px-3 rounded-full text-[12px] font-medium bg-blush-50 text-blush-700 hover:bg-blush-100 hover:text-blush-800 transition-colors duration-150"
        >
          Lihat Detail
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function CatalogClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = (params.get("cat") as ProductCategory | "all" | null) ?? "all";

  const [active, setActive] = React.useState<typeof initial>(initial);
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [page, setPage] = React.useState(1);

  const productAreaRef = React.useRef<HTMLDivElement>(null);

  // Sync category from URL params
  React.useEffect(() => {
    const cat = params.get("cat");
    setActive(cat ? (cat as ProductCategory) : "all");
  }, [params]);

  // Reset to page 1 whenever filter or search changes
  React.useEffect(() => {
    setPage(1);
  }, [active, search]);

  // ── Derived state ──────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let result =
      active === "all" ? products : products.filter((p) => p.category === active);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));
    return result;
  }, [active, products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Page number list with ellipsis for large sets
  const pageNumbers = React.useMemo<(number | "…")[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums: (number | "…")[] = [1];
    if (safePage > 3) nums.push("…");
    for (
      let n = Math.max(2, safePage - 1);
      n <= Math.min(totalPages - 1, safePage + 1);
      n++
    ) {
      nums.push(n);
    }
    if (safePage < totalPages - 2) nums.push("…");
    nums.push(totalPages);
    return nums;
  }, [totalPages, safePage]);

  // ── Handlers ────────────────────────────────────────────────────

  const setTab = (key: typeof active) => {
    setActive(key);
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", key);
    router.replace(`${pathname}${url.search}`, { scroll: false });
  };

  const goToPage = (n: number) => {
    setPage(n);
    if (productAreaRef.current) {
      const top =
        productAreaRef.current.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div ref={productAreaRef}>
      {/* ── Filter + Search bar (sticky) ── */}
      <div className="sticky top-[60px] md:top-[68px] z-30 -mx-4 md:mx-0 px-4 py-3 md:py-4 backdrop-blur-xl bg-background/85 border-b border-blush-100/50 md:rounded-3xl md:border md:bg-white/70 md:px-5 md:my-5 md:relative md:top-0 md:shadow-card">
        {/* Search input row */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari bouquet favoritmu..."
              className="w-full h-10 pl-10 pr-10 rounded-full text-[13px] text-ink-900 placeholder:text-ink-300 bg-blush-50/80 border border-blush-100/80 focus:outline-none focus:border-blush-300 focus:bg-white transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 hover:bg-blush-200 transition-colors"
              >
                <span className="text-[10px] font-bold leading-none">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter pills + view toggle row */}
        <div className="flex items-center gap-2">
          {/* Scrollable category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 flex-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-[13px] font-medium transition-all duration-200 border",
                  active === t.key
                    ? "bg-gradient-to-br from-blush-500 to-blush-600 text-white border-transparent shadow-soft"
                    : "bg-white text-ink-600 border-blush-100/80 hover:bg-blush-50 hover:text-blush-700 hover:border-blush-200",
                )}
              >
                <span className="text-[13px]">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid / List view toggle */}
          <div className="shrink-0 flex gap-0.5 p-1 rounded-full bg-blush-50 border border-blush-100/80">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
                viewMode === "grid"
                  ? "bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-soft"
                  : "text-ink-400 hover:text-blush-600",
              )}
            >
              <LayoutGrid className="h-[15px] w-[15px]" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
                viewMode === "list"
                  ? "bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-soft"
                  : "text-ink-400 hover:text-blush-600",
              )}
            >
              <List className="h-[15px] w-[15px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Product area ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${active}-${viewMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-ink-400">
              <p className="text-4xl mb-3">✿</p>
              <p className="font-serif text-lg text-ink-600">
                {search.trim()
                  ? "Produk tidak ditemukan"
                  : "Belum ada produk di kategori ini"}
              </p>
              <p className="text-sm mt-1">
                {search.trim() ? "Coba kata kunci lain" : "Segera hadir!"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            // Grid view — unchanged ProductGrid component
            <ProductGrid products={paginated} />
          ) : (
            // List view — compact horizontal cards
            <div className="flex flex-col gap-3">
              {paginated.map((p) => (
                <ProductListCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Pagination ── */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => goToPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className={cn(
              "h-9 px-3.5 rounded-full text-[13px] font-medium border transition-all duration-200 flex items-center gap-1",
              safePage === 1
                ? "border-blush-100/60 text-ink-300 bg-white cursor-not-allowed"
                : "border-blush-200 text-ink-600 bg-white hover:bg-blush-50 hover:text-blush-700 hover:border-blush-300",
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          {pageNumbers.map((n, i) =>
            n === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="h-9 w-9 flex items-center justify-center text-ink-300 text-[13px]"
              >
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => goToPage(n as number)}
                className={cn(
                  "h-9 w-9 rounded-full text-[13px] font-medium border transition-all duration-200",
                  safePage === n
                    ? "bg-gradient-to-br from-blush-500 to-blush-600 text-white border-transparent shadow-soft"
                    : "border-blush-100/80 text-ink-600 bg-white hover:bg-blush-50 hover:text-blush-700 hover:border-blush-300",
                )}
              >
                {n}
              </button>
            ),
          )}

          {/* Next */}
          <button
            onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className={cn(
              "h-9 px-3.5 rounded-full text-[13px] font-medium border transition-all duration-200 flex items-center gap-1",
              safePage === totalPages
                ? "border-blush-100/60 text-ink-300 bg-white cursor-not-allowed"
                : "border-blush-200 text-ink-600 bg-white hover:bg-blush-50 hover:text-blush-700 hover:border-blush-300",
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Product count */}
      {filtered.length > 0 && (
        <p className="text-center text-[12px] text-ink-300 mt-3">
          Menampilkan {(safePage - 1) * PER_PAGE + 1}–
          {Math.min(safePage * PER_PAGE, filtered.length)} dari {filtered.length}{" "}
          produk
        </p>
      )}
    </div>
  );
}
