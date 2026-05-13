"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flower2, Info, ScrollText } from "lucide-react";
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
      <div className="mx-3 mb-3 rounded-3xl bg-white/85 backdrop-blur-xl border border-blush-100 shadow-soft">
        <ul className="grid grid-cols-4 h-16">
          {ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <li key={href} className="flex items-center justify-center">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full rounded-2xl mx-1 transition",
                    active
                      ? "text-blush-600"
                      : "text-ink-500 hover:text-blush-600",
                  )}
                >
                  <span
                    className={cn(
                      "h-9 w-9 flex items-center justify-center rounded-2xl transition",
                      active ? "bg-blush-100" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-medium leading-none">
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
