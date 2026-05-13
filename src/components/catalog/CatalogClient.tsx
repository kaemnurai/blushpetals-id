"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CATEGORY_LABEL, type Product, type ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "artificial-bouquet", label: CATEGORY_LABEL["artificial-bouquet"] },
  { key: "premium-collection", label: CATEGORY_LABEL["premium-collection"] },
  { key: "fresh-flower", label: CATEGORY_LABEL["fresh-flower"] },
];

export function CatalogClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = (params.get("cat") as ProductCategory | "all" | null) ?? "all";
  const [active, setActive] = React.useState<typeof initial>(initial);

  React.useEffect(() => {
    const cat = params.get("cat");
    if (cat) setActive(cat as ProductCategory);
    else setActive("all");
  }, [params]);

  const filtered = React.useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const setTab = (key: typeof active) => {
    setActive(key);
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", key);
    router.replace(`${pathname}${url.search}`, { scroll: false });
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-3 md:-mx-0 px-3 py-3 backdrop-blur bg-background/80 border-b border-blush-100/60 md:rounded-3xl md:border md:bg-white/60 md:px-4 md:my-4 md:relative md:top-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 px-4 h-10 rounded-full text-xs md:text-sm transition border",
                active === t.key
                  ? "bg-ink-900 text-white border-ink-900 shadow-soft"
                  : "bg-white text-ink-700 border-blush-100 hover:bg-blush-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <ProductGrid products={filtered} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
