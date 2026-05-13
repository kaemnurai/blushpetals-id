"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/data/site";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 bg-gradient-to-b from-cream-50 to-blush-50 border-t border-blush-100/60">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-200 to-cream-200 flex items-center justify-center text-blush-700 font-serif text-xl">
              ❀
            </span>
            <span className="font-serif text-xl text-ink-900">{SITE.name}</span>
          </div>
          <p className="text-sm text-ink-500 max-w-sm">
            {SITE.description}
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href={`https://instagram.com/${SITE.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blush-600 border border-blush-100 hover:bg-blush-100 transition"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href={quickEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#25D366] border border-blush-100 hover:bg-blush-50 transition"
              aria-label="WhatsApp"
            >
              <Phone className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-ink-900 mb-3 text-sm">Navigasi</h4>
          <ul className="space-y-2 text-sm text-ink-500">
            {NAV_ITEMS.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="hover:text-blush-600 transition">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-ink-900 mb-3 text-sm">Kontak</h4>
          <ul className="space-y-2 text-sm text-ink-500">
            <li className="flex items-start gap-2">
              <Phone className="h-3.5 w-3.5 mt-1 text-blush-500" />
              +62 813-2211-8378
            </li>
            <li className="flex items-start gap-2">
              <Instagram className="h-3.5 w-3.5 mt-1 text-blush-500" />
              {SITE.instagram}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-3.5 w-3.5 mt-1 text-blush-500" />
              hello@blushpetals.id
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-1 text-blush-500" />
              Bandung, Indonesia
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blush-100/60">
        <div className="container py-4 text-xs text-ink-400 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Made with ♡ for every blooming moment.</span>
        </div>
      </div>
    </footer>
  );
}
