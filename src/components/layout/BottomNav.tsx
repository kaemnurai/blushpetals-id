"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flower2, Info, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Katalog", href: "/katalog", icon: Flower2 },
  { label: "Cara Order", href: "/cara-pemesanan", icon: ScrollText },
  { label: "Tentang", href: "/tentang", icon: Info },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="mx-3 mb-3 rounded-[1.75rem] bg-white/90 backdrop-blur-2xl border border-blush-100/80 shadow-[0_8px_32px_-8px_rgba(154,70,92,0.18),0_0_0_1px_rgba(255,209,220,0.3)]">
        <ul className="grid grid-cols-4 h-16">
          {ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <li key={href} className="flex items-center justify-center">
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 w-full h-full px-1 transition-colors duration-200"
                >
                  <span className="relative flex items-center justify-center">
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-pill"
                        className="absolute inset-0 -m-2 rounded-xl bg-blush-100"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] relative z-10 transition-colors duration-200",
                        active ? "text-blush-600" : "text-ink-400",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-colors duration-200",
                      active ? "text-blush-600" : "text-ink-400",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
