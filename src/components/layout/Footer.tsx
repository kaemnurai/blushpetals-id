"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/data/site";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf6] via-[#fff5f7] to-[#ffedf2]" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-blush-100/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cream-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blush-200/80 to-transparent" />

      {/* ── Main 3-column row ── */}
      <div className="relative z-10 container py-10 md:py-12">
        <div className="grid md:grid-cols-3 gap-10 md:gap-14 items-start">

          {/* Left — Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-200 via-blush-300 to-cream-200 flex items-center justify-center text-blush-700 text-base shadow-[0_3px_12px_rgba(247,107,148,0.2)] shrink-0">
                ❀
              </span>
              <span className="font-serif text-[15px] text-ink-900 leading-none">
                Blush Petals
                <span className="text-blush-500 font-sans font-normal text-[11px]">.id</span>
              </span>
            </div>

            <p className="font-serif text-sm italic text-blush-500 font-light leading-relaxed">
              {SITE.tagline}
            </p>

            <div className="flex gap-2.5 pt-0.5">
              <Link
                href={`https://instagram.com/${SITE.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full
                           bg-white border border-blush-100 text-blush-600 text-[12px] font-medium
                           hover:border-blush-300 hover:bg-blush-50 hover:scale-105
                           transition-all duration-200 shadow-card"
              >
                <Instagram className="h-3 w-3 shrink-0" />
                Instagram
              </Link>
              <Link
                href={quickEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-full
                           bg-white border border-blush-100 text-[#1a9e4e] text-[12px] font-medium
                           hover:border-[#b3e8c4] hover:bg-[#f0faf4] hover:scale-105
                           transition-all duration-200 shadow-card"
              >
                <MessageCircle className="h-3 w-3 shrink-0" />
                WhatsApp
              </Link>
            </div>
          </div>

          {/* Center — Navigation */}
          <div>
            <p className="section-label mb-5">Navigasi</p>
            <ul className="space-y-3">
              {NAV_ITEMS.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="text-[13px] text-ink-500 hover:text-blush-600 transition-colors duration-150 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-blush-200 group-hover:bg-blush-400 transition-colors duration-150 shrink-0" />
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Contact */}
          <div>
            <p className="section-label mb-5">Hubungi Kami</p>
            <ul className="space-y-2.5">
              <li>
                <a href={quickEnquiryUrl()} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-[13px] text-ink-500 hover:text-blush-600 transition-colors duration-150 group">
                  <Phone className="h-3.5 w-3.5 text-blush-300 shrink-0 group-hover:text-blush-500 transition-colors duration-150" />
                  +62 813-2211-8378
                </a>
              </li>
              <li>
                <a href={`https://instagram.com/${SITE.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-[13px] text-ink-500 hover:text-blush-600 transition-colors duration-150 group">
                  <Instagram className="h-3.5 w-3.5 text-blush-300 shrink-0 group-hover:text-blush-500 transition-colors duration-150" />
                  {SITE.instagram}
                </a>
              </li>
              <li>
                <a href="mailto:blushpetals.id@gmail.com"
                   className="flex items-center gap-2 text-[13px] text-ink-500 hover:text-blush-600 transition-colors duration-150 group">
                  <Mail className="h-3.5 w-3.5 text-blush-300 shrink-0 group-hover:text-blush-500 transition-colors duration-150" />
                  blushpetals.id@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-ink-400">
                <MapPin className="h-3.5 w-3.5 text-blush-300 shrink-0 mt-px" />
                Sharia Green Valley 2, Rangkasbitung
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10">
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-blush-100 to-transparent" />
        </div>
        <div className="container py-4 text-center">
          <span className="text-[11px] text-ink-300 font-light tracking-wide">
            © {year} BlushPetals.id —{" "}
            <span className="font-serif italic text-blush-400">
              "Merangkai kebahagiaan, satu bouquet."
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

