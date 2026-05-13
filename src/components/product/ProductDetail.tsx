"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "./ProductGallery";
import { OrderModal } from "./OrderModal";
import { formatRupiah } from "@/lib/utils";

const WRAPPING_COLORS = [
  { name: "Soft Pink", hex: "#ffd1dc" },
  { name: "Cream", hex: "#fde7d2" },
  { name: "White", hex: "#ffffff" },
  { name: "Dusty Rose", hex: "#d4889a" },
  { name: "Lavender", hex: "#d6c8e8" },
];

export function ProductDetail({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const [wrap, setWrap] = React.useState(WRAPPING_COLORS[0].name);
  const [note, setNote] = React.useState("");

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
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

            <div className="hidden md:flex items-center gap-3 pt-2">
              <Button onClick={() => setOpen(true)} size="lg" disabled={soldOut}>
                <ShoppingBag className="h-4 w-4" />
                {soldOut ? "Sold Out" : "Pesan Sekarang"}
              </Button>
              <Button variant="secondary" size="lg">
                <Heart className="h-4 w-4" />
                Simpan
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky bottom CTA (mobile) */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-3 safe-bottom">
        <div className="mx-1 rounded-3xl glass shadow-soft p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-ink-500">Harga</p>
            <p className="font-serif text-base text-ink-900">{formatRupiah(product.price)}</p>
          </div>
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

      <OrderModal open={open} onClose={() => setOpen(false)} product={{ ...product }} />
    </>
  );
}
