// CART FEATURE START
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { CartOrderModal } from "./CartOrderModal";
import { formatRupiah, cn } from "@/lib/utils";

// ── Quantity control ──────────────────────────────────────────────

function QtyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-7 w-7 rounded-full border border-blush-200 bg-white text-ink-600 hover:bg-blush-50 hover:border-blush-300 flex items-center justify-center transition"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-7 text-center text-sm font-medium text-ink-900 select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-7 w-7 rounded-full border border-blush-200 bg-white text-ink-600 hover:bg-blush-50 hover:border-blush-300 flex items-center justify-center transition"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── CartPanel ─────────────────────────────────────────────────────

export function CartPanel() {
  const { items, removeItem, updateQty, clearCart, totalPrice, totalCount, panelOpen, setPanelOpen } =
    useCart();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const fn = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const drawerVariants = {
    initial: isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 },
    animate: isDesktop ? { x: 0, opacity: 1 }      : { y: 0, opacity: 1 },
    exit:    isDesktop ? { x: "100%", opacity: 0 }  : { y: "100%", opacity: 0 },
  };

  // Close on Escape
  React.useEffect(() => {
    if (!panelOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setPanelOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [panelOpen, setPanelOpen]);

  // Lock body scroll
  React.useEffect(() => {
    if (panelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [panelOpen]);

  return (
    <>
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cart-backdrop"
              className="fixed inset-0 z-[90] bg-ink-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPanelOpen(false)}
            />

            {/* Drawer — right side on md+, bottom sheet on mobile */}
            <motion.aside
              key="cart-drawer"
              className={cn(
                "fixed z-[95] bg-white shadow-2xl flex flex-col",
                "bottom-0 left-0 right-0 rounded-t-3xl max-h-[90vh]",
                "md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-[400px] md:max-h-none md:h-full md:rounded-none md:rounded-l-3xl",
              )}
              variants={drawerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-blush-100/60 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blush-500" />
                  <h2 className="font-serif text-lg text-ink-900">Keranjang</h2>
                  {totalCount > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-blush-500 text-white text-[11px] font-semibold flex items-center justify-center">
                      {totalCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="h-8 w-8 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:bg-blush-100 hover:text-ink-600 transition"
                  aria-label="Tutup keranjang"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <span className="text-4xl mb-3">🛒</span>
                    <p className="font-serif text-base text-ink-700">Keranjang kosong</p>
                    <p className="text-xs text-ink-400 mt-1">
                      Tambahkan produk dari halaman produk
                    </p>
                    <Button
                      variant="soft"
                      size="sm"
                      className="mt-4"
                      onClick={() => setPanelOpen(false)}
                    >
                      Lanjut Belanja
                    </Button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex gap-3 rounded-2xl border border-blush-100/60 bg-white p-3 shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-cream-50 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-ink-400">—</div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 leading-tight truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          {item.wrapping && `Wrap: ${item.wrapping}`}
                          {item.wrapping && item.ribbon && " · "}
                          {item.ribbon && `Pita: ${item.ribbon}`}
                        </p>
                        <p className="text-sm font-semibold text-blush-600 mt-1">
                          {formatRupiah(item.price * item.quantity)}
                          {item.quantity > 1 && (
                            <span className="ml-1 text-[11px] text-ink-400 font-normal">
                              ({formatRupiah(item.price)} × {item.quantity})
                            </span>
                          )}
                        </p>
                        {/* Qty + delete row */}
                        <div className="flex items-center justify-between mt-2">
                          <QtyControl
                            value={item.quantity}
                            onChange={(n) => updateQty(item.cartId, n)}
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(item.cartId)}
                            className="h-7 w-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="shrink-0 border-t border-blush-100/60 px-5 py-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink-600">Total</p>
                    <p className="font-serif text-xl font-semibold text-blush-600">
                      {formatRupiah(totalPrice)}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Pesan Semua
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setPanelOpen(false)}
                    >
                      Lanjut Belanja
                    </Button>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="flex-1 h-9 rounded-full text-xs text-red-400 hover:text-red-500 hover:bg-red-50 transition font-medium"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>
              )}

              {/* Safe-area spacer for mobile */}
              <div className="md:hidden h-safe-bottom pb-1 shrink-0" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Checkout modal (multi-product order form) */}
      <CartOrderModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        totalPrice={totalPrice}
        onSuccess={() => {
          setCheckoutOpen(false);
          setPanelOpen(false);
          clearCart();
        }}
      />
    </>
  );
}
// CART FEATURE END
