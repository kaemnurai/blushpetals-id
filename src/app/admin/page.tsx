"use client";

import * as React from "react";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, Flower2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <AdminShell email={email} onSignOut={signOut}>
          <Dashboard />
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function Dashboard() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const total = products.length;
  const tersedia = products.filter((p) => p.stock_status === "tersedia").length;
  const preorder = products.filter((p) => p.stock_status === "preorder").length;
  const avgPrice = total ? Math.round(products.reduce((a, b) => a + b.price, 0) / total) : 0;

  return (
    <div>
      <div className="mb-8">
        <p className="text-blush-600 text-xs uppercase tracking-widest">Dashboard</p>
        <h1 className="font-serif text-3xl text-ink-900 mt-1">Selamat datang ✿</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Stat icon={Package} label="Total Produk" value={loading ? "…" : total.toString()} />
        <Stat icon={Flower2} label="Tersedia" value={loading ? "…" : tersedia.toString()} />
        <Stat icon={ShoppingBag} label="Pre-order" value={loading ? "…" : preorder.toString()} />
        <Stat icon={TrendingUp} label="Rata Harga" value={loading ? "…" : formatRupiah(avgPrice)} />
      </div>

      <div className="rounded-3xl bg-white border border-blush-100 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-ink-900">Aksi Cepat</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            href="/admin/produk"
            className="rounded-2xl border border-blush-100 p-4 hover:bg-blush-50 transition flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-2xl bg-blush-100 text-blush-600 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-ink-900 text-sm">Kelola Produk</p>
              <p className="text-xs text-ink-500">Tambah, edit, hapus produk</p>
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-2xl border border-blush-100 p-4 hover:bg-blush-50 transition flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-2xl bg-cream-100 text-blush-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-ink-900 text-sm">Lihat Website</p>
              <p className="text-xs text-ink-500">Buka tampilan customer</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white border border-blush-100 p-4 md:p-5 shadow-card">
      <div className="flex items-center gap-2 text-blush-600 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-serif text-2xl text-ink-900">{value}</p>
    </div>
  );
}
