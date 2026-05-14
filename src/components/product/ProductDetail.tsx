"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft, ShoppingBag,
  Share2, MessageCircle, Camera, Send,
  Link2, X, ExternalLink, CheckCircle2, Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "./ProductGallery";
import { OrderModal } from "./OrderModal";
import { formatRupiah, cn } from "@/lib/utils";

// ── Wrapping options ──────────────────────────────────────────────

const WRAPPING_COLORS = [
  { name: "Soft Pink", hex: "#ffd1dc" },
  { name: "Cream",     hex: "#fde7d2" },
  { name: "White",     hex: "#ffffff" },
  { name: "Dusty Rose", hex: "#d4889a" },
  { name: "Lavender",  hex: "#d6c8e8" },
];

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
}: {
  product: Product;
  size?: "md" | "lg";
}) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const getUrl = React.useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/produk/${product.slug}`;
  }, [product.slug]);

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        onClick={() => setModalOpen(true)}
        aria-label="Share produk"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

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

// ── Product detail ────────────────────────────────────────────────

export function ProductDetail({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const [wrap, setWrap] = React.useState(WRAPPING_COLORS[0].name);
  const [note, setNote] = React.useState("");

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

            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink-900">
                {product.name}
              </h1>
              <p className="text-2xl md:text-3xl text-blush-600 font-medium mt-2">
                {formatRupiah(product.price)}
              </p>
            </div>

            <p className="text-sm text-ink-700 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-700">Pilihan Wrapping</p>
              <div className="flex flex-wrap gap-2">
                {WRAPPING_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setWrap(c.name)}
                    className={`group flex items-center gap-2 px-3 h-10 rounded-full border text-xs transition ${
                      wrap === c.name
                        ? "border-blush-500 bg-blush-50 text-blush-700"
                        : "border-blush-100 text-ink-700 hover:bg-blush-50"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-ink-900/10"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-700">Catatan Tambahan</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Permintaan khusus untuk bouquet ini..."
                className="w-full min-h-[96px] rounded-2xl border border-blush-100 px-4 py-3 text-sm bg-white/80 focus:border-blush-300 focus:outline-none focus:ring-4 focus:ring-blush-100 resize-none"
              />
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 pt-2">
              <Button onClick={() => setOpen(true)} size="lg" disabled={soldOut}>
                <ShoppingBag className="h-4 w-4" />
                {soldOut ? "Sold Out" : "Pesan Sekarang"}
              </Button>
              <ShareButton product={product} size="lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-3 safe-bottom">
        <div className="mx-1 rounded-3xl glass shadow-soft p-3 flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-ink-500">Harga</p>
            <p className="font-serif text-base text-ink-900">{formatRupiah(product.price)}</p>
          </div>
          <ShareButton product={product} size="md" />
          <Button
            onClick={() => setOpen(true)}
            disabled={soldOut}
            className="flex-shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? "Sold Out" : "Pesan"}
          </Button>
        </div>
      </div>

      <OrderModal
        open={open}
        onClose={() => setOpen(false)}
        product={{ ...product }}
        initialWrap={wrap}
        initialNote={note}
      />
    </>
  );
}
