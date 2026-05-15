"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  LogOut, ExternalLink, MoreHorizontal, X, Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellProps {
  email?: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

const NAV = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
  { label: "Produk",     href: "/admin/produk",     icon: Package },
  { label: "Pesanan",    href: "/admin/orders",     icon: ShoppingCart },
  { label: "Analitik",   href: "/admin/analytics",  icon: BarChart3 },
  { label: "Transaksi",  href: "/admin/transaksi",  icon: Receipt },
];

export function AdminShell({ email, onSignOut, children }: ShellProps) {
  const pathname = usePathname();
  const initial  = email ? email[0].toUpperCase() : "A";
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Close sheet on route change
  React.useEffect(() => { setSheetOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Desktop Sidebar — hidden on mobile ── */}
      <aside className="hidden md:flex w-60 min-h-screen bg-white/80 backdrop-blur-xl border-r border-blush-100/70 p-6 sticky top-0 h-screen flex-col shrink-0">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-200 via-blush-300 to-cream-200 flex items-center justify-center text-blush-700 text-base shadow-soft group-hover:shadow-glow-sm transition-shadow duration-300 shrink-0">
            ❀
          </span>
          <span className="leading-none">
            <span className="block font-serif text-[15px] text-ink-900">Blush Petals</span>
            <span className="block text-[10px] text-ink-400 mt-0.5">Admin Panel</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1">
          <p className="section-label mb-3 px-3">Menu</p>
          <ul className="space-y-0.5">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 h-10 rounded-2xl text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-blush-50 text-blush-700 shadow-[0_1px_4px_rgba(247,107,148,0.12)]"
                        : "text-ink-600 hover:bg-blush-50/60 hover:text-blush-700",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-blush-500" : "text-ink-400")} />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 h-10 rounded-2xl text-[13px] font-medium text-ink-600 hover:bg-blush-50/60 hover:text-blush-700 transition-all duration-150"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-ink-400" />
                Lihat Website
              </Link>
            </li>
          </ul>
        </nav>

        {/* User */}
        <div className="pt-5 border-t border-blush-100/60">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blush-100 to-cream-100 border border-blush-200 flex items-center justify-center text-blush-600 text-xs font-semibold shrink-0">
              {initial}
            </span>
            <span className="flex-1 min-w-0">
              <p className="text-[10px] text-ink-400 leading-none mb-0.5">Logged in</p>
              <p className="text-[12px] text-ink-700 truncate leading-none">{email ?? "—"}</p>
            </span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-2xl bg-blush-50 text-blush-700 text-[12px] font-medium hover:bg-blush-100 transition-colors duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      {/* pb-28 on mobile leaves room for bottom nav; md+ uses normal padding */}
      <main className="flex-1 p-5 pb-28 md:p-8 md:pb-8 lg:p-10 lg:pb-10 min-w-0">
        {children}
      </main>

      {/* ════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION — hidden on md+
          Floating pill-shaped navbar, fixed at bottom.
          ════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-4">
          {/* Floating pill */}
          <div className="rounded-[2rem] bg-white/95 backdrop-blur-xl border border-blush-100/70 shadow-premium px-2 py-2">
            <div className="flex items-center justify-around">

              {/* 4 main nav items */}
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all duration-150",
                      active
                        ? "bg-blush-50 text-blush-600"
                        : "text-ink-400 hover:text-blush-500",
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", active ? "text-blush-500" : "text-ink-400")} />
                    <span className={cn(
                      "text-[9px] font-semibold leading-none",
                      active ? "text-blush-600" : "text-ink-400",
                    )}>
                      {label}
                    </span>
                  </Link>
                );
              })}

              {/* Lainnya — opens bottom sheet */}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-ink-400 hover:text-blush-500 transition-colors duration-150"
              >
                <MoreHorizontal className="h-[18px] w-[18px]" />
                <span className="text-[9px] font-semibold leading-none">Lainnya</span>
              </button>

            </div>
          </div>
        </div>
        {/* Safe-area spacer for iPhone notch */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>

      {/* ════════════════════════════════════════════════
          BOTTOM SHEET — "Lainnya" menu
          ════════════════════════════════════════════════ */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end"
          onMouseDown={() => setSheetOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" />

          {/* Sheet panel */}
          <div
            className="relative w-full bg-white rounded-t-3xl shadow-premium animate-slide-up"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 bg-blush-200 rounded-full" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-blush-100/60">
              <span className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-100 to-cream-100 border border-blush-200 flex items-center justify-center text-blush-600 text-sm font-semibold shrink-0">
                {initial}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-ink-400 leading-none mb-0.5">Admin</p>
                <p className="text-[13px] font-medium text-ink-800 truncate">{email ?? "—"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:bg-blush-100 transition shrink-0"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-3 space-y-1">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-blush-50 transition-colors duration-150"
              >
                <span className="h-9 w-9 rounded-xl bg-blush-50 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-4 w-4 text-blush-600" />
                </span>
                <span>
                  <p className="text-[13px] font-medium text-ink-900">Lihat Website</p>
                  <p className="text-[11px] text-ink-400">Buka tampilan customer</p>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => { setSheetOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-red-50 transition-colors duration-150"
              >
                <span className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <LogOut className="h-4 w-4 text-red-500" />
                </span>
                <span className="text-left">
                  <p className="text-[13px] font-medium text-red-600">Keluar</p>
                  <p className="text-[11px] text-ink-400">Logout dari admin panel</p>
                </span>
              </button>
            </div>

            {/* Bottom safe area */}
            <div className="h-8" />
          </div>
        </div>
      )}

    </div>
  );
}
