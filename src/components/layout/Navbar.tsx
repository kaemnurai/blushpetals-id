"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/data/site";
import { cn } from "@/lib/utils";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-blush-100/60" : "bg-transparent",
      )}
    >
      <nav className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-200 to-cream-200 flex items-center justify-center text-blush-700 font-serif text-lg group-hover:scale-105 transition">
            ❀
          </span>
          <span className="font-serif text-lg text-ink-900 leading-none">
            {SITE.name}
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full transition relative",
                    active
                      ? "text-blush-700 bg-blush-50"
                      : "text-ink-700 hover:text-blush-600 hover:bg-blush-50/60",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href={quickEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-br from-blush-500 to-blush-600 text-white text-sm shadow-soft hover:shadow-glow transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Pesan Sekarang
          </Link>
          <Link
            href="/katalog"
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full bg-blush-100 text-blush-700"
            aria-label="Katalog"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
