"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ShoppingBag,
  Share2, MessageCircle, Camera, Send,
  Link2, X, ExternalLink, CheckCircle2, Smartphone,
  // CART FEATURE START
  ShoppingCart,
  // CART FEATURE END
} from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "./ProductGallery";
import { OrderModal } from "./OrderModal";
import { formatRupiah, cn } from "@/lib/utils";
import { BOUQUET_COLORS } from "@/lib/data/bouquet-colors";
// CART FEATURE START
import { useCart } from "@/lib/cart-context";
// CART FEATURE END

// ── Share option row ──────────────────────────────────────────────

function ShareOption({
  icon: Icon, bg, iconColor,
  label, sublabel,
  onClick, copied = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  bg: string; iconColor: string;
  label: string; sublabel: string;
  onClick: () => void;
  copied?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blush-50 active:bg-blush-100 transition-colors duration-150 text-left group"
    >
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-[1.06]",
        bg,
      )}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink-900 leading-tight">{label}</p>
        <p className={cn("text-[11px] mt-0.5 leading-snug", copied ? "text-blush-600" : "text-ink-400")}>
          {sublabel}
        </p>
      </div>
      {copied && <CheckCircle2 className="h-4 w-4 text-blush-500 shrink-0" />}
    </button>
  );
}

// ── Share modal ───────────────────────────────────────────────────

function ShareModal({
  product,
  getUrl,
  onClose,
}: {
  product: Product;
  getUrl: () => string;
  onClose: () => void;
}) {
  const [igCopied, setIgCopied] = React.useState<"story" | "dm" | null>(null);

  // Close on Escape
  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  // Prevent body scroll while modal open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `💐 Lihat bouquet cantik ini di Blush Petals.id!\n\n*${product.name}*\n${formatRupiah(product.price)}\n\n${getUrl()}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleInstagram = async (type: "story" | "dm") => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setIgCopied(type);
      toast.success(
        type === "story"
          ? "Link disalin! Tempel di Instagram Story kamu ✨"
          : "Link disalin! Kirim via Instagram DM kamu ✨",
      );
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const openInstagram = () => {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      toast.success("Link berhasil disalin ✿");
    } catch {
      toast.error("Gagal menyalin link");
    }
    onClose();
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: product.name,
          text: `Lihat ${product.name} di Blush Petals.id — ${formatRupiah(product.price)}`,
          url: getUrl(),
        });
      } catch { /* user cancelled */ }
    }
    onClose();
  };

  const hasNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" />

      {/* Panel — bottom sheet on mobile, centered card on desktop */}
      <div className="relative w-full sm:max-w-[360px] mx-auto animate-slide-up">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-premium overflow-hidden">

          {/* Handle (mobile visual hint) */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-blush-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 sm:pt-5 pb-3 border-b border-blush-100/60">
            <div>
              <h3 className="font-serif text-base text-ink-900">Bagikan Produk</h3>
              <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[220px]">
                {product.name} · {formatRupiah(product.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:bg-blush-100 hover:text-ink-600 transition"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Options */}
          <div className="px-3 py-3 space-y-0.5">

            {/* WhatsApp */}
            <ShareOption
              icon={MessageCircle}
              bg="bg-emerald-50" iconColor="text-emerald-600"
              label="WhatsApp"
              sublabel="Bagikan ke kontak WhatsApp"
              onClick={shareWhatsApp}
            />

            {/* Instagram Story */}
            <div className="rounded-xl overflow-hidden">
              <ShareOption
                icon={Camera}
                bg="bg-gradient-to-br from-pink-50 to-purple-50"
                iconColor="text-pink-500"
                label="Instagram Story"
                sublabel={
                  igCopied === "story"
                    ? "Link disalin! Tempel di Story kamu."
                    : "Salin link lalu tempel di Instagram Story"
                }
                onClick={() => handleInstagram("story")}
                copied={igCopied === "story"}
              />
              {igCopied === "story" && (
                <button
                  type="button"
                  onClick={openInstagram}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-100/50 text-[12px] text-pink-600 font-medium hover:from-pink-100 hover:to-purple-100 transition-colors duration-150"
                >
                  Buka Instagram
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Instagram DM */}
            <div className="rounded-xl overflow-hidden">
              <ShareOption
                icon={Send}
                bg="bg-indigo-50" iconColor="text-indigo-500"
                label="Instagram DM"
                sublabel={
                  igCopied === "dm"
                    ? "Link disalin! Kirim via DM Instagram."
                    : "Salin link lalu kirim via Direct Message"
                }
                onClick={() => handleInstagram("dm")}
                copied={igCopied === "dm"}
              />
              {igCopied === "dm" && (
                <button
                  type="button"
                  onClick={openInstagram}
                  className="w-full flex items-center justify-between px-4 py-2 bg-indigo-50 border-t border-indigo-100/50 text-[12px] text-indigo-600 font-medium hover:bg-indigo-100 transition-colors duration-150"
                >
                  Buka Instagram
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Copy link */}
            <ShareOption
              icon={Link2}
              bg="bg-blush-50" iconColor="text-blush-600"
              label="Salin Link"
              sublabel="Copy URL produk ini"
              onClick={copyLink}
            />
          </div>

          {/* Native share (optional, shown only if supported) */}
          {hasNativeShare && (
            <div className="px-3 pb-4 pt-1 border-t border-blush-100/50 mt-1">
              <button
                type="button"
                onClick={shareNative}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] text-ink-400 hover:bg-blush-50 hover:text-ink-600 transition-colors duration-150"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Bagikan via Perangkat
              </button>
            </div>
          )}

          {/* Safe-area spacer for mobile notch */}
          <div className="sm:hidden h-safe-bottom pb-2" />
        </div>
      </div>
    </div>
  );
}

// ── Share button (opens modal) ────────────────────────────────────

function ShareButton({
  product,
  size = "lg",
  iconOnly = false,
}: {
  product: Product;
  size?: "md" | "lg";
  iconOnly?: boolean;
}) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const getUrl = React.useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/produk/${product.slug}`;
  }, [product.slug]);

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Share produk"
          className="h-9 w-9 rounded-full bg-blush-50 border border-blush-100 flex items-center justify-center text-blush-500 hover:bg-blush-100 hover:text-blush-600 transition"
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : (
        <Button
          variant="secondary"
          size={size}
          onClick={() => setModalOpen(true)}
          aria-label="Share produk"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {modalOpen && (
        <ShareModal
          product={product}
          getUrl={getUrl}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Thank-You Popup (shown when user returns from WhatsApp) ──────

function ThankYouPopup({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="ty-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 380 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blush-200 via-blush-500 to-blush-200" />

        {/* X close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-blush-100 transition"
          aria-label="Tutup"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="px-6 pt-7 pb-7 text-center">
          {/* Flower icon */}
          <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-blush-50 flex items-center justify-center">
            <span className="text-3xl" role="img" aria-label="bouquet">💐</span>
          </div>

          <h2 className="font-serif text-xl font-semibold text-ink-900 mb-2 leading-snug">
            Terima kasih sudah memesan!
          </h2>
          <p className="text-sm text-ink-500 leading-relaxed">
            Terima kasih sudah memesan di{" "}
            <span className="font-semibold text-blush-600">BlushPetals.id</span>{" "}💐
            <br />
            Silakan lanjutkan chat admin melalui WhatsApp untuk konfirmasi pesanan.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full h-11 rounded-2xl bg-blush-500 hover:bg-blush-600 active:bg-blush-700 text-white text-sm font-semibold transition-colors"
          >
            Mengerti
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Product detail ────────────────────────────────────────────────

export function ProductDetail({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const [wrap, setWrap] = React.useState(BOUQUET_COLORS[0].name);
  const [ribbon, setRibbon] = React.useState(BOUQUET_COLORS[0].name);
  const [deliveryMethod, setDeliveryMethod] = React.useState<"ambil" | "diantar">("ambil");
  const [showThankYou, setShowThankYou] = React.useState(false);
  // CART FEATURE START
  const { addItem } = useCart();

  const handleAddToCart = React.useCallback(() => {
    addItem({
      productId:   product.id,
      productName: product.name,
      price:       product.price,
      image:       product.image ?? "",
      wrapping:    wrap,
      ribbon,
      quantity:    1,
    });
    toast.success(`${product.name} ditambahkan ke keranjang 🛒`);
  }, [addItem, product, wrap, ribbon]);
  // CART FEATURE END

  // Detect user returning from WhatsApp via visibilitychange
  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const raw = localStorage.getItem("blushpetals_wa_sent");
      if (!raw) return;
      const elapsed = Date.now() - Number(raw);
      localStorage.removeItem("blushpetals_wa_sent");
      if (elapsed < 3_600_000) {
        setOpen(false);
        setShowThankYou(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleThankYouClose = React.useCallback(() => {
    setShowThankYou(false);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];
  const soldOut = product.stock_status === "sold-out";

  return (
    <>
      <section className="container py-4 md:py-10">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1 text-sm text-ink-700 hover:text-blush-600 mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke katalog
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductGallery images={gallery} alt={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5 pb-28 md:pb-0"
          >
            <div className="flex flex-wrap gap-2">
              <Badge>{CATEGORY_LABEL[product.category]}</Badge>
              {product.badge && <Badge variant="blush">{product.badge}</Badge>}
              <Badge variant={soldOut ? "dark" : "outline"}>
                {STATUS_LABEL[product.stock_status]}
              </Badge>
            </div>

            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-3xl md:text-4xl text-ink-900">
                  {product.name}
                </h1>
                <p className="text-2xl md:text-3xl text-blush-600 font-medium mt-2">
                  {formatRupiah(product.price)}
                </p>
              </div>
              {/* Share icon — mobile only, positioned beside title */}
              <div className="md:hidden shrink-0 mt-1">
                <ShareButton product={product} iconOnly />
              </div>
            </div>

            <p className="text-sm text-ink-700 leading-relaxed">
              {product.description}
            </p>

            {/* Pilihan Wrapping */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-700">Pilihan Wrapping</p>
              {/* Mobile: horizontal swipe-scroll · Desktop: flex-wrap grid */}
              <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-x-visible pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0"
                style={{ scrollbarWidth: "none" }}>
                {BOUQUET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setWrap(c.name)}
                    className={cn(
                      "flex items-center gap-2 px-3 h-10 rounded-full border text-xs font-medium transition-all shrink-0",
                      wrap === c.name
                        ? "border-blush-500 bg-blush-50 text-blush-700 shadow-sm"
                        : "border-blush-100 text-ink-700 hover:bg-blush-50 hover:border-blush-200"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-ink-900/10 shrink-0"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pilihan Pita */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-700">Pilihan Pita</p>
              {/* Mobile: horizontal swipe-scroll · Desktop: flex-wrap grid */}
              <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-x-visible pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0"
                style={{ scrollbarWidth: "none" }}>
                {BOUQUET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setRibbon(c.name)}
                    className={cn(
                      "flex items-center gap-2 px-3 h-10 rounded-full border text-xs font-medium transition-all shrink-0",
                      ribbon === c.name
                        ? "border-blush-500 bg-blush-50 text-blush-700 shadow-sm"
                        : "border-blush-100 text-ink-700 hover:bg-blush-50 hover:border-blush-200"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-ink-900/10 shrink-0"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Metode Pesanan */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-700">Metode Pesanan</p>
              <div className="flex rounded-2xl border border-blush-100 bg-blush-50/40 p-1 gap-1">
                {([
                  { value: "diantar", label: "Diantar" },
                  { value: "ambil",   label: "Ambil di Toko" },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDeliveryMethod(value)}
                    className={`flex-1 h-9 rounded-xl text-xs font-medium transition-all ${
                      deliveryMethod === value
                        ? "bg-white text-blush-700 shadow-sm border border-blush-200"
                        : "text-ink-500 hover:text-ink-700 hover:bg-white/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 pt-2 flex-wrap">
              {/* CART FEATURE START */}
              <Button
                variant="secondary"
                size="lg"
                onClick={handleAddToCart}
                disabled={soldOut}
              >
                <ShoppingCart className="h-4 w-4" />
                Masukkan Keranjang
              </Button>
              {/* CART FEATURE END */}
              <Button onClick={() => setOpen(true)} size="lg" disabled={soldOut}>
                <ShoppingBag className="h-4 w-4" />
                {soldOut ? "Sold Out" : "Pesan Sekarang"}
              </Button>
              <ShareButton product={product} size="lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile sticky CTA — 2 buttons side by side */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="flex gap-2.5">
          {/* CART FEATURE START */}
          <Button
            variant="secondary"
            onClick={handleAddToCart}
            disabled={soldOut}
            className="flex-1 h-12 rounded-2xl text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Keranjang
          </Button>
          {/* CART FEATURE END */}
          <Button
            onClick={() => setOpen(true)}
            disabled={soldOut}
            className="flex-1 h-12 rounded-2xl text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? "Sold Out" : "Beli Sekarang"}
          </Button>
        </div>
      </div>

      <OrderModal
        open={open}
        onClose={() => setOpen(false)}
        product={{ ...product }}
        initialWrap={wrap}
        initialRibbon={ribbon}
        initialMethod={deliveryMethod}
      />

      <AnimatePresence>
        {showThankYou && <ThankYouPopup onClose={handleThankYouClose} />}
      </AnimatePresence>
    </>
  );
}
