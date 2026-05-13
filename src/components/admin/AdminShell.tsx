"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellProps {
  email?: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: Package },
];

export function AdminShell({ email, onSignOut, children }: ShellProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen bg-white/70 backdrop-blur border-b md:border-b-0 md:border-r border-blush-100 p-5 md:p-6 md:sticky md:top-0">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-200 to-cream-200 flex items-center justify-center text-blush-700 font-serif">
            ❀
          </span>
          <div>
            <p className="font-serif text-base text-ink-900 leading-none">Blush Petals</p>
            <p className="text-[10px] text-ink-400 mt-1">Admin Panel</p>
          </div>
        </Link>

        <nav>
          <ul className="space-y-1">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-10 rounded-2xl text-sm transition",
                      active ? "bg-blush-100 text-blush-700" : "text-ink-700 hover:bg-blush-50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 h-10 rounded-2xl text-sm text-ink-700 hover:bg-blush-50"
              >
                <ExternalLink className="h-4 w-4" />
                Lihat Website
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-10 pt-5 border-t border-blush-100/60">
          <p className="text-[10px] text-ink-400">Logged in as</p>
          <p className="text-xs text-ink-700 truncate">{email ?? "—"}</p>
          <button
            onClick={onSignOut}
            className="mt-3 inline-flex items-center gap-2 h-9 px-4 rounded-full bg-blush-50 text-blush-700 text-xs hover:bg-blush-100 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
