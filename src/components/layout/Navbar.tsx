"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ShoppingCart } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { quickEnquiryUrl } from "@/lib/whatsapp";
// CART FEATURE START
import { useCart } from "@/lib/cart-context";
// CART FEATURE END

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  // CART FEATURE START
  const { totalCount, setPanelOpen } = useCart();
  // CART FEATURE END

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/88 backdrop-blur-2xl border-b border-blush-100/50 shadow-[0_1px_0_rgba(247,107,148,0.06),0_4px_24px_-4px_rgba(154,70,92,0.1)]"
          : "bg-transparent",
      )}
    >
      <nav className="container flex items-center justify-between h-[60px] md:h-[68px]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-300 via-blush-200 to-cream-200 flex items-center justify-center text-blush-700 text-base shadow-[0_2px_8px_rgba(247,107,148,0.22)] group-hover:shadow-glow-sm group-hover:scale-105 transition-all duration-300">
            ❀
          </span>
          <span className="leading-none flex flex-col">
            <span className="font-serif text-[15px] md:text-base text-ink-900 tracking-tight">
              Blush Petals
            </span>
            <span className="text-blush-500 font-sans font-normal text-[11px]">.id</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-[13px] rounded-full transition-all duration-200 font-medium block",
                    active
                      ? "text-blush-700"
                      : "text-ink-600 hover:text-blush-600",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-blush-50 border border-blush-100/70 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-2">
          {/* CART FEATURE START */}
          <motion.button
            type="button"
            onClick={() => setPanelOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-10 w-10 inline-flex items-center justify-center rounded-full bg-blush-50 text-blush-600 hover:bg-blush-100 hover:text-blush-700 transition"
            aria-label="Keranjang"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-blush-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </motion.button>
          {/* CART FEATURE END */}

          <motion.a
            href={quickEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full
                       bg-gradient-to-br from-blush-400 via-blush-500 to-blush-600
                       text-white text-[13px] font-medium
                       shadow-soft hover:shadow-glow
                       transition-shadow duration-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Pesan Sekarang
          </motion.a>

          <Link
            href="/katalog"
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full bg-blush-50 text-blush-600 hover:bg-blush-100 hover:text-blush-700 transition"
            aria-label="Katalog"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
