"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, TrendingUp,
  AlertCircle, ShoppingCart, Clock, RefreshCw,
  CheckCheck, Wallet, CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRupiah, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

// ── Page ──────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────

interface DashStats {
  products: { total: number; tersedia: number };
  orders: {
    total: number; pending: number; accepted: number;
    completed: number; rejected: number; today: number;
  };
  revenue: {
    total: number; thisWeek: number; thisMonth: number; thisYear: number;
  };
}

interface RecentOrder {
  id: string; customer_name: string; status: OrderStatus;
  total_price: number; created_at: string;
  product_name: string; product_image: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const STATUS_DOT: Record<OrderStatus, string> = {
  pending:   "bg-amber-400",
  accepted:  "bg-blue-400",
  completed: "bg-emerald-400",
  rejected:  "bg-red-400",
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending:   "Menunggu",
  accepted:  "Diterima",
  completed: "Selesai",
  rejected:  "Ditolak",
};

type OrderRow = { id: string; status: string; total_price: number; created_at: string };

// ── Dashboard ─────────────────────────────────────────────────────

function Dashboard() {
  const [stats,   setStats]   = React.useState<DashStats | null>(null);
  const [recent,  setRecent]  = React.useState<RecentOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }

    setLoading(true);
    setError(null);

    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);

    Promise.all([
      supabase.from("products").select("id, stock_status"),
      supabase.from("orders").select("id, status, total_price, created_at"),
      supabase
        .from("orders")
        .select("id, customer_name, status, total_price, created_at, order_items(products(title, image))")
        .order("created_at", { ascending: false })
        .limit(5),
    ])
      .then(([prodsRes, ordersRes, recentRes]) => {
        if (prodsRes.error)  throw new Error(prodsRes.error.message);
        if (ordersRes.error) throw new Error(ordersRes.error.message);

        const ps = (prodsRes.data  ?? []) as { stock_status: string }[];
        const os = (ordersRes.data ?? []) as OrderRow[];

        const billable = os.filter(o => o.status === "accepted" || o.status === "completed");
        const rev = (arr: OrderRow[]) => arr.reduce((acc, o) => acc + (o.total_price || 0), 0);

        setStats({
          products: {
            total:    ps.length,
            tersedia: ps.filter(p => p.stock_status === "tersedia").length,
          },
          orders: {
            total:     os.length,
            pending:   os.filter(o => o.status === "pending").length,
            accepted:  os.filter(o => o.status === "accepted").length,
            completed: os.filter(o => o.status === "completed").length,
            rejected:  os.filter(o => o.status === "rejected").length,
            today:     os.filter(o => new Date(o.created_at) >= todayStart).length,
          },
          revenue: {
            total:     rev(billable),
            thisWeek:  rev(billable.filter(o => new Date(o.created_at) >= weekStart)),
            thisMonth: rev(billable.filter(o => new Date(o.created_at) >= monthStart)),
            thisYear:  rev(billable.filter(o => new Date(o.created_at) >= yearStart)),
          },
        });

        if (!recentRes.error && recentRes.data) {
          setRecent(
            (recentRes.data as Record<string, unknown>[]).map(row => {
              const items =
                (row.order_items as { products: { title?: string; image?: string } | null }[] | null) ?? [];
              return {
                id:            String(row.id ?? ""),
                customer_name: String(row.customer_name ?? ""),
                status:        (row.status as OrderStatus) ?? "pending",
                total_price:   Number(row.total_price ?? 0),
                created_at:    String(row.created_at ?? ""),
                product_name:  items[0]?.products?.title ?? "—",
                product_image: items[0]?.products?.image ?? null,
              };
            }),
          );
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const ch = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const { products, orders, revenue } = stats ?? {
    products: { total: 0, tersedia: 0 },
    orders:   { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0, today: 0 },
    revenue:  { total: 0, thisWeek: 0, thisMonth: 0, thisYear: 0 },
  };

  const s = (n: number) => loading ? null : n;
  const r = (n: number) => loading ? null : n;
  const totalOrders = orders.total || 1;
  const pct = (n: number) => Math.min(100, Math.round((n / totalOrders) * 100));

  return (
    <div className="space-y-4">

      {/* Heading */}
      <div className="flex items-start justify-between pb-2">
        <div>
          <p className="section-label mb-1">Dashboard</p>
          <h1 className="font-serif text-3xl text-ink-900">Selamat datang ✿</h1>
          <p className="text-sm text-ink-400 mt-1">Kelola produk dan pesanan Blush Petals.id.</p>
        </div>
        <button type="button" onClick={load} disabled={loading}
          className="h-9 w-9 rounded-2xl border border-blush-100 bg-white flex items-center justify-center text-ink-400 hover:text-blush-600 hover:bg-blush-50 transition disabled:opacity-40"
          aria-label="Refresh">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Pending alert */}
      {!loading && !error && orders.pending > 0 && (
        <Link href="/admin/orders" className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition">
          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
          <span><span className="font-semibold">{orders.pending} pesanan</span> menunggu konfirmasi</span>
          <span className="ml-auto text-amber-600 text-xs font-medium">Lihat →</span>
        </Link>
      )}

      {/* ── Section 1: KPI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={ShoppingCart}  label="Total Pesanan"     value={s(orders.total)}      accent="from-blush-100 to-cream-100"  iconColor="text-blush-600" />
        <KpiCard icon={Wallet}        label="Total Revenue"     value={r(revenue.total)}     accent="from-purple-50 to-pink-50"    iconColor="text-purple-500" isRupiah sub="Diterima + Selesai" />
        <KpiCard icon={Package}       label="Produk Aktif"      value={s(products.tersedia)} accent="from-emerald-50 to-teal-50"   iconColor="text-emerald-500" sub={`dari ${products.total} produk`} />
        <KpiCard icon={CalendarCheck} label="Pesanan Hari Ini"  value={s(orders.today)}      accent="from-amber-50 to-yellow-50"   iconColor="text-amber-500" />
      </div>

      {/* ── Section 2: Order Status ── */}
      <div className="rounded-3xl bg-white border border-blush-100/70 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base text-ink-900">Status Pesanan</h2>
          <Link href="/admin/orders" className="text-[11px] text-blush-500 hover:text-blush-700 font-medium flex items-center gap-0.5 transition">
            Kelola <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "pending"   as OrderStatus, label: "Menunggu",  count: orders.pending,   bar: "bg-amber-300",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100" },
            { key: "accepted"  as OrderStatus, label: "Diterima",  count: orders.accepted,  bar: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-100" },
            { key: "completed" as OrderStatus, label: "Selesai",   count: orders.completed, bar: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
            { key: "rejected"  as OrderStatus, label: "Ditolak",   count: orders.rejected,  bar: "bg-red-300",     text: "text-red-600",     bg: "bg-red-50",     border: "border-red-100" },
          ].map(st => (
            <Link key={st.key} href="/admin/orders"
              className={cn("rounded-2xl border p-3 hover:opacity-80 transition-opacity duration-150", st.bg, st.border)}>
              <p className={cn("text-[10px] uppercase tracking-widest font-medium mb-1.5", st.text)}>{st.label}</p>
              <p className={cn("font-serif text-2xl leading-none mb-2", st.text)}>
                {loading ? <span className="inline-block h-6 w-10 bg-white/60 rounded animate-pulse" /> : st.count}
              </p>
              <div className="h-1 rounded-full bg-white/60 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", st.bar)}
                  style={{ width: loading ? "0%" : `${pct(st.count)}%` }} />
              </div>
              {!loading && <p className={cn("text-[10px] mt-1 opacity-60", st.text)}>{pct(st.count)}%</p>}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Section 3: Recent Orders + Revenue Overview ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Recent Orders */}
        <div className="rounded-3xl bg-white border border-blush-100/70 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base text-ink-900">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-[11px] text-blush-500 hover:text-blush-700 font-medium flex items-center gap-0.5 transition">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blush-50 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-blush-50 rounded-full animate-pulse" />
                    <div className="h-3 w-24 bg-blush-50 rounded-full animate-pulse" />
                  </div>
                  <div className="h-3.5 w-16 bg-blush-50 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-blush-200 mx-auto mb-2" />
              <p className="text-sm text-ink-400">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recent.map(o => (
                <div key={o.id} className="flex items-center gap-3 py-2.5 rounded-xl px-2 hover:bg-blush-50/50 transition-colors duration-150">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-cream-50 shrink-0 border border-blush-100/60">
                    {o.product_image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={o.product_image} alt={o.product_name} className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-blush-200" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-900 truncate leading-tight">{o.customer_name}</p>
                    <p className="text-[11px] text-ink-400 truncate">{o.product_name}<span className="mx-1 text-ink-200">·</span>{timeAgo(o.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-semibold text-blush-600">{formatRupiah(o.total_price)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[o.status])} />
                      <span className="text-[10px] text-ink-400">{STATUS_LABEL_MAP[o.status]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Overview */}
        <div className="rounded-3xl bg-white border border-blush-100/70 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base text-ink-900">Revenue Overview</h2>
            <Link href="/admin/analytics" className="text-[11px] text-blush-500 hover:text-blush-700 font-medium flex items-center gap-0.5 transition">
              Detail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2.5 flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-blush-50/60 animate-pulse" />
              ))
            ) : (
              [
                { label: "Minggu ini", value: revenue.thisWeek,  dot: "bg-blush-300" },
                { label: "Bulan ini",  value: revenue.thisMonth, dot: "bg-blush-500" },
                { label: "Tahun ini",  value: revenue.thisYear,  dot: "bg-blush-700" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blush-50/50 border border-blush-100/60">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", row.dot)} />
                    <span className="text-sm text-ink-600">{row.label}</span>
                  </div>
                  <span className="font-serif text-sm font-medium text-blush-600">{formatRupiah(row.value)}</span>
                </div>
              ))
            )}
          </div>

          {!loading && (
            <div className="mt-4 pt-4 border-t border-blush-100/60 space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 text-ink-500">
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Selesai hari ini
                </span>
                <span className="font-semibold text-emerald-600">{Math.min(orders.today, orders.completed)} order</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 text-ink-500">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Menunggu konfirmasi
                </span>
                <span className="font-semibold text-amber-600">{orders.pending} order</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: Quick Actions ── */}
      <div className="rounded-3xl bg-white border border-blush-100/70 p-5 shadow-card">
        <h2 className="font-serif text-base text-ink-900 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <QuickAction href="/admin/produk"    icon={Package}      accent="bg-blush-100 text-blush-600"  title="Kelola Produk"  desc="Tambah & edit" />
          <QuickAction href="/admin/orders"    icon={ShoppingCart} accent="bg-amber-50 text-amber-600"   title="Pesanan"        desc="Konfirmasi order" />
          <QuickAction href="/admin/analytics" icon={TrendingUp}   accent="bg-purple-50 text-purple-600" title="Analitik"       desc="Laporan penjualan" />
          <QuickAction href="/"  external      icon={ShoppingBag}  accent="bg-cream-100 text-blush-600"  title="Lihat Website"  desc="Tampilan customer" />
        </div>
      </div>

    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, accent, iconColor, isRupiah = false, sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number | null;
  accent: string; iconColor: string;
  isRupiah?: boolean; sub?: string;
}) {
  return (
    <div className="rounded-3xl bg-white border border-blush-100/70 p-5 shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-[10px] text-ink-400 uppercase tracking-[0.16em] mb-1">{label}</p>
      <p className="font-serif text-3xl text-ink-900 leading-none truncate">
        {value === null
          ? <span className="inline-block h-7 w-20 bg-blush-50 rounded-lg animate-pulse align-middle" />
          : isRupiah ? formatRupiah(value) : String(value)}
      </p>
      {sub && value !== null && <p className="text-[11px] text-ink-400 mt-1.5">{sub}</p>}
    </div>
  );
}

// ── Quick Action ──────────────────────────────────────────────────

function QuickAction({
  href, external, icon: Icon, accent, title, desc,
}: {
  href: string; external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; title: string; desc: string;
}) {
  return (
    <Link href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3 rounded-2xl border border-blush-100/70 p-3.5 hover:bg-blush-50/50 hover:-translate-y-0.5 transition-all duration-150">
      <span className={`h-9 w-9 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <p className="font-medium text-ink-900 text-[13px] leading-tight">{title}</p>
        <p className="text-[11px] text-ink-400 mt-0.5">{desc}</p>
      </span>
    </Link>
  );
}
