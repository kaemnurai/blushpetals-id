"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Search, Download, RefreshCw, AlertCircle, Package,
  Phone, MapPin, Gift, StickyNote, Truck, XCircle,
  ChevronDown, ChevronUp, Eye, X, Calendar,
  TrendingUp, ShoppingCart, Wallet, Coins,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Page ──────────────────────────────────────────────────────────

export default function TransaksiPage() {
  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <AdminShell email={email} onSignOut={signOut}>
          <TransaksiContent />
        </AdminShell>
      )}
    </AdminGuard>
  );
}

// ── Types ─────────────────────────────────────────────────────────

interface TxOrder {
  id: string;
  customer_name: string;
  whatsapp: string;
  status: string;
  total_price: number;
  extra_cost: number;
  order_date: string | null;
  pickup_date: string | null;
  delivery_method: string;
  wrapping: string;
  greeting_card: string;
  order_notes: string;
  extra_cost_note: string | null;
  created_at: string;
}

interface TxItem {
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  capital_price: number;
}

interface TransactionRow extends TxOrder {
  revenue: number;
  modal: number;
  profit: number;
  items: TxItem[];
  product_name: string;
  product_image: string | null;
}

type SortKey = "created_at" | "revenue" | "profit" | "modal";
type SortDir = "asc" | "desc";

// ── Helpers ───────────────────────────────────────────────────────

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

const fmtDateShort = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" }); }
  catch { return "—"; }
};

const fmtDateTime = (d: string) => {
  try { return new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return "—"; }
};

function orderRef(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  accepted:  "bg-blue-50 text-blue-700 border-blue-100",
};
const STATUS_LABEL: Record<string, string> = {
  completed: "Selesai", accepted: "Diterima",
};

// ── Safe fetchers ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOrdersSafe(sb: any): Promise<TxOrder[]> {
  // Try with extra_cost + extra_cost_note + order_date + delivery_method + greeting_card
  const fullSel = "id,customer_name,whatsapp,status,total_price,extra_cost,extra_cost_note,order_date,pickup_date,delivery_method,wrapping,greeting_card,order_notes,created_at";
  const { data, error } = await sb.from("orders")
    .select(fullSel)
    .in("status", ["completed"])
    .order("created_at", { ascending: false });

  if (!error) {
    return ((data ?? []) as Record<string, unknown>[]).map(r => ({
      id:              String(r.id ?? ""),
      customer_name:   String(r.customer_name ?? ""),
      whatsapp:        String(r.whatsapp ?? ""),
      status:          String(r.status ?? ""),
      total_price:     Number(r.total_price ?? 0),
      extra_cost:      Number(r.extra_cost ?? 0),
      extra_cost_note: (r.extra_cost_note as string | null) ?? null,
      order_date:      (r.order_date as string | null) ?? null,
      pickup_date:     (r.pickup_date as string | null) ?? null,
      delivery_method: String(r.delivery_method ?? ""),
      wrapping:        String(r.wrapping ?? ""),
      greeting_card:   String(r.greeting_card ?? ""),
      order_notes:     String(r.order_notes ?? ""),
      created_at:      String(r.created_at ?? ""),
    }));
  }

  const isSchema = error.message.includes("schema cache") || error.message.includes("Could not find") ||
    error.message.includes("extra_cost") || error.message.includes("order_date") ||
    error.message.includes("delivery_method") || error.message.includes("greeting_card");
  if (!isSchema) throw new Error(error.message);

  // Fallback: minimal columns
  const { data: d2, error: e2 } = await sb.from("orders")
    .select("id,customer_name,whatsapp,status,total_price,pickup_date,wrapping,order_notes,created_at")
    .in("status", ["completed"])
    .order("created_at", { ascending: false });
  if (e2) throw new Error(e2.message);

  return ((d2 ?? []) as Record<string, unknown>[]).map(r => ({
    id:              String(r.id ?? ""),
    customer_name:   String(r.customer_name ?? ""),
    whatsapp:        String(r.whatsapp ?? ""),
    status:          String(r.status ?? ""),
    total_price:     Number(r.total_price ?? 0),
    extra_cost:      0,
    extra_cost_note: null,
    order_date:      null,
    pickup_date:     (r.pickup_date as string | null) ?? null,
    delivery_method: "",
    wrapping:        String(r.wrapping ?? ""),
    greeting_card:   "",
    order_notes:     String(r.order_notes ?? ""),
    created_at:      String(r.created_at ?? ""),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchItemsSafe(sb: any, orderIds: string[]): Promise<TxItem[]> {
  if (orderIds.length === 0) return [];

  const { data, error } = await sb.from("order_items")
    .select("order_id,product_id,quantity,price,products(title,image,capital_price)")
    .in("order_id", orderIds);

  if (!error) {
    return ((data ?? []) as Record<string, unknown>[]).map(r => {
      const prod = r.products as { title?: string; image?: string; capital_price?: number } | null;
      return {
        order_id:      String(r.order_id ?? ""),
        product_id:    (r.product_id as string | null) ?? null,
        product_name:  prod?.title ?? "Produk dihapus",
        product_image: prod?.image ?? null,
        quantity:      Number(r.quantity ?? 1),
        price:         Number(r.price ?? 0),
        capital_price: Number(prod?.capital_price ?? 0),
      };
    });
  }

  const isSchema = error.message.includes("capital_price") || error.message.includes("schema cache") ||
    error.message.includes("Could not find");
  if (!isSchema) throw new Error(error.message);

  const { data: d2, error: e2 } = await sb.from("order_items")
    .select("order_id,product_id,quantity,price,products(title,image)")
    .in("order_id", orderIds);
  if (e2) throw new Error(e2.message);

  return ((d2 ?? []) as Record<string, unknown>[]).map(r => {
    const prod = r.products as { title?: string; image?: string } | null;
    return {
      order_id:      String(r.order_id ?? ""),
      product_id:    (r.product_id as string | null) ?? null,
      product_name:  prod?.title ?? "Produk dihapus",
      product_image: prod?.image ?? null,
      quantity:      Number(r.quantity ?? 1),
      price:         Number(r.price ?? 0),
      capital_price: 0,
    };
  });
}

// ── CSV Export ────────────────────────────────────────────────────

function exportCSV(rows: TransactionRow[]) {
  const headers = [
    "ID Order", "Customer", "WhatsApp", "Produk", "Qty",
    "Harga Jual", "Extra Cost", "Keterangan Extra", "Revenue",
    "Modal", "Profit Bersih", "Status", "Tanggal",
  ];
  const escape = (s: string | number | null) => {
    const str = String(s ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const csvRows = rows.map(r => [
    orderRef(r.id),
    r.customer_name,
    r.whatsapp,
    r.items.map(i => `${i.product_name} (${i.quantity}x)`).join(" | "),
    r.items.reduce((a, i) => a + i.quantity, 0),
    r.total_price,
    r.extra_cost,
    r.extra_cost_note ?? "",
    r.revenue,
    r.modal,
    r.profit,
    STATUS_LABEL[r.status] ?? r.status,
    fmtDateTime(r.created_at),
  ].map(escape).join(","));

  const content = [headers.map(escape).join(","), ...csvRows].join("\n");
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `transaksi-blushpetals-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ────────────────────────────────────────────────

function Skel({ className }: { className?: string }) {
  return <div className={cn("bg-blush-50/80 rounded-xl animate-pulse", className)} />;
}

function SortBtn({ col, current, dir, onSort }: {
  col: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = col === current;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className="inline-flex items-center gap-0.5 hover:text-blush-600 transition-colors"
    >
      {active
        ? (dir === "desc"
          ? <ChevronDown className="h-3 w-3 text-blush-500" />
          : <ChevronUp   className="h-3 w-3 text-blush-500" />)
        : <ChevronDown className="h-3 w-3 opacity-30" />}
    </button>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────

function DetailModal({ row, onClose }: { row: TransactionRow; onClose: () => void }) {
  const isGoSend = row.delivery_method?.toLowerCase().includes("gosend");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink-900/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-premium overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blush-100/60 shrink-0">
          <div>
            <p className="font-serif text-[15px] text-ink-900">Detail Transaksi</p>
            <p className="text-[11px] text-ink-400 font-mono mt-0.5">{orderRef(row.id)}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:bg-blush-100 hover:text-ink-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Customer */}
          <section>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-2.5">Customer</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-100 to-cream-100 flex items-center justify-center text-blush-600 font-bold text-[14px] shrink-0">
                {row.customer_name.trim()[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-[14px] text-ink-900">{row.customer_name}</p>
                <a href={waLink(row.whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline">
                  <Phone className="h-3 w-3" />{row.whatsapp}
                </a>
              </div>
            </div>
          </section>

          {/* Products */}
          <section>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-2.5">Produk</p>
            <div className="space-y-2">
              {row.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-blush-50/50 border border-blush-100/60">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-cream-50 shrink-0">
                    {it.product_image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-blush-200" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-900 truncate">{it.product_name}</p>
                    <p className="text-[11px] text-ink-400">{it.quantity}× {idr(it.price)}</p>
                  </div>
                  {it.capital_price > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-ink-400">Modal/pcs</p>
                      <p className="text-[11px] font-medium text-amber-700">{idr(it.capital_price)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Order details */}
          <section>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-2.5">Detail Pesanan</p>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {row.delivery_method && (
                <div className="flex items-center gap-1.5 text-ink-600">
                  {isGoSend
                    ? <Truck  className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    : <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />}
                  <span>{isGoSend ? "GoSend" : "Ambil di Toko"}</span>
                </div>
              )}
              {row.wrapping && (
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Gift className="h-3.5 w-3.5 text-blush-400 shrink-0" />
                  <span className="truncate">{row.wrapping}</span>
                </div>
              )}
              {row.pickup_date && (
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Calendar className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                  <span>Ambil: {fmtDateShort(row.pickup_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-ink-600">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                  STATUS_STYLE[row.status] ?? "bg-blush-50 text-blush-700 border-blush-100")}>
                  {STATUS_LABEL[row.status] ?? row.status}
                </span>
              </div>
            </div>
            {row.greeting_card && (
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-ink-500 italic">
                <Gift className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blush-300" />
                &ldquo;{row.greeting_card}&rdquo;
              </div>
            )}
            {row.order_notes && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-ink-500 italic">
                <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                &ldquo;{row.order_notes}&rdquo;
              </div>
            )}
          </section>

          {/* Financial summary */}
          <section>
            <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-2.5">Ringkasan Keuangan</p>
            <div className="rounded-2xl bg-blush-50/40 border border-blush-100/60 divide-y divide-blush-100/60 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 text-[13px]">
                <span className="text-ink-500">Harga Produk</span>
                <span className="font-medium text-ink-900">{idr(row.total_price)}</span>
              </div>
              {row.extra_cost > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-ink-500">
                    Extra Cost
                    {row.extra_cost_note && <span className="text-ink-400 ml-1">({row.extra_cost_note})</span>}
                  </span>
                  <span className="font-medium text-amber-700">+{idr(row.extra_cost)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5 text-[13px]">
                <span className="font-semibold text-ink-700">Total Revenue</span>
                <span className="font-bold text-blush-600">{idr(row.revenue)}</span>
              </div>
              {row.modal > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-ink-500">Total Modal</span>
                  <span className="font-medium text-amber-700">-{idr(row.modal)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 text-[14px] bg-emerald-50/60">
                <span className="font-bold text-emerald-800">Profit Bersih</span>
                <span className="font-bold text-emerald-700">{idr(row.profit)}</span>
              </div>
            </div>
          </section>

          <p className="text-center text-[10px] text-ink-300">{fmtDateTime(row.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────

function TransaksiContent() {
  const [rows,      setRows]      = React.useState<TransactionRow[]>([]);
  const [loading,   setLoading]   = React.useState(true);
  const [error,     setError]     = React.useState<string | null>(null);
  const [search,    setSearch]    = React.useState("");
  const [sortKey,   setSortKey]   = React.useState<SortKey>("created_at");
  const [sortDir,   setSortDir]   = React.useState<SortDir>("desc");
  const [detail,    setDetail]    = React.useState<TransactionRow | null>(null);
  const [dateFrom,  setDateFrom]  = React.useState("");
  const [dateTo,    setDateTo]    = React.useState("");

  const load = React.useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const orders = await fetchOrdersSafe(sb);
      const ids    = orders.map(o => o.id);
      const items  = await fetchItemsSafe(sb, ids);

      // Build per-order modal map
      const modalMap = new Map<string, number>();
      for (const it of items) {
        modalMap.set(it.order_id, (modalMap.get(it.order_id) ?? 0) + it.capital_price * it.quantity);
      }

      const txRows: TransactionRow[] = orders.map(o => {
        const orderItems = items.filter(i => i.order_id === o.id);
        const rev   = o.total_price + o.extra_cost;
        const modal = modalMap.get(o.id) ?? 0;
        return {
          ...o,
          revenue:       rev,
          modal,
          profit:        rev - modal,
          items:         orderItems,
          product_name:  orderItems[0]?.product_name ?? "—",
          product_image: orderItems[0]?.product_image ?? null,
        };
      });

      setRows(txRows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat transaksi";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Realtime: reload when orders change OR when product prices/modal change
  React.useEffect(() => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const ch = sb.channel("transaksi-realtime")
      .on("postgres_changes", { event: "*",      schema: "public", table: "orders" },   () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [load]);

  // Summary KPIs
  const kpis = React.useMemo(() => ({
    revenue: rows.reduce((a, r) => a + r.revenue, 0),
    profit:  rows.reduce((a, r) => a + r.profit,  0),
    modal:   rows.reduce((a, r) => a + r.modal,   0),
    count:   rows.length,
  }), [rows]);

  // Filter + sort
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let res = rows.filter(r => {
      if (q && !(
        r.customer_name.toLowerCase().includes(q) ||
        r.whatsapp.includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.items.some(i => i.product_name.toLowerCase().includes(q))
      )) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(r.created_at) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(r.created_at) > to) return false;
      }
      return true;
    });

    res = [...res].sort((a, b) => {
      const va = sortKey === "created_at" ? new Date(a[sortKey]).getTime() : a[sortKey] as number;
      const vb = sortKey === "created_at" ? new Date(b[sortKey]).getTime() : b[sortKey] as number;
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return res;
  }, [rows, search, sortKey, sortDir, dateFrom, dateTo]);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Heading */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Laporan</p>
          <h1 className="font-serif text-3xl text-ink-900">Transaksi</h1>
          <p className="text-sm text-ink-400 mt-1">
            Seluruh pesanan berstatus{" "}
            <span className="text-emerald-600 font-medium">Selesai</span>
            {" "}dengan rincian revenue, modal, dan profit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportCSV(filtered)}
            disabled={loading || filtered.length === 0}
            className="h-9 px-4 rounded-xl bg-white border border-blush-100 shadow-card text-[12px] font-medium text-ink-600 hover:bg-blush-50 hover:text-blush-700 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button" onClick={load} disabled={loading}
            className="h-9 w-9 rounded-xl border border-blush-100 bg-white flex items-center justify-center text-ink-400 hover:text-blush-600 hover:bg-blush-50 transition disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Wallet,      label: "Total Revenue",  value: idr(kpis.revenue), color: "text-blush-600",   bg: "bg-blush-50",   iconBg: "bg-blush-100" },
          { icon: TrendingUp,  label: "Profit Bersih",  value: idr(kpis.profit),  color: "text-emerald-700", bg: "bg-emerald-50", iconBg: "bg-emerald-100" },
          { icon: Coins,       label: "Total Modal",    value: idr(kpis.modal),   color: "text-amber-700",   bg: "bg-amber-50",   iconBg: "bg-amber-100" },
          { icon: ShoppingCart,label: "Total Transaksi",value: String(kpis.count),color: "text-blue-700",    bg: "bg-blue-50",    iconBg: "bg-blue-100" },
        ].map(({ icon: Icon, label, value, color, bg, iconBg }) => (
          <div key={label} className={cn("rounded-2xl border border-transparent p-4 flex items-center gap-3", bg)}>
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-[10px] text-ink-400 uppercase tracking-wider">{label}</p>
              {loading
                ? <div className="h-5 w-20 bg-white/60 rounded-full animate-pulse mt-0.5" />
                : <p className={cn("font-serif text-[17px] font-bold leading-tight", color)}>{value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari customer, produk, ID…"
            className="w-full h-9 pl-10 pr-3 rounded-full text-[13px] text-ink-900 placeholder:text-ink-300 bg-white border border-blush-100/80 focus:outline-none focus:border-blush-300 transition"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 transition">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="h-9 px-3 rounded-full text-[12px] text-ink-700 bg-white border border-blush-100/80 focus:outline-none focus:border-blush-300 transition" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="h-9 px-3 rounded-full text-[12px] text-ink-700 bg-white border border-blush-100/80 focus:outline-none focus:border-blush-300 transition" />

        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="h-9 px-3 rounded-full text-[12px] text-ink-500 bg-white border border-blush-100 hover:bg-blush-50 transition flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      {!loading && (
        <p className="text-[11px] text-ink-400 mb-3">
          {filtered.length} transaksi
          {search && <span> · pencarian &ldquo;{search}&rdquo;</span>}
        </p>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-blush-100/70 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-blush-100/60 bg-blush-50/40">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">ID / Tanggal</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">Produk</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    Revenue
                    <SortBtn col="revenue" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    Modal
                    <SortBtn col="modal" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    Profit
                    <SortBtn col="profit" current={sortKey} dir={sortDir} onSort={handleSort} />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-ink-400 whitespace-nowrap">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-blush-50">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skel className={j === 0 ? "h-8 w-24" : j === 7 ? "h-7 w-7" : "h-4 w-full"} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="h-12 w-12 rounded-3xl bg-blush-50 flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-6 w-6 text-blush-200" />
                    </div>
                    <p className="text-sm text-ink-400">
                      {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada transaksi"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-blush-50 hover:bg-blush-50/30 cursor-pointer transition-colors duration-100"
                    onClick={() => setDetail(row)}
                  >
                    {/* ID / Tanggal */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-mono text-[11px] text-ink-500 bg-blush-50 px-1.5 py-0.5 rounded inline-block">
                        {orderRef(row.id)}
                      </p>
                      <p className="text-[10px] text-ink-300 mt-0.5">{fmtDate(row.created_at)}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-ink-900 text-[13px] max-w-[120px] truncate">{row.customer_name}</p>
                      <p className="text-[10px] text-ink-400">{row.whatsapp}</p>
                    </td>

                    {/* Produk */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        {row.product_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.product_image} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0 border border-blush-100"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-ink-800 font-medium">{row.product_name}</p>
                          {row.items.length > 1 && (
                            <p className="text-[10px] text-ink-400">+{row.items.length - 1} lainnya</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <p className="font-semibold text-blush-600">{idr(row.revenue)}</p>
                      {row.extra_cost > 0 && (
                        <p className="text-[10px] text-amber-600">+{idr(row.extra_cost)}</p>
                      )}
                    </td>

                    {/* Modal */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <p className={cn("font-medium", row.modal > 0 ? "text-amber-700" : "text-ink-300")}>
                        {row.modal > 0 ? idr(row.modal) : "—"}
                      </p>
                    </td>

                    {/* Profit */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <p className={cn("font-bold", row.profit > 0 ? "text-emerald-600" : "text-red-400")}>
                        {idr(row.profit)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        STATUS_STYLE[row.status] ?? "bg-blush-50 text-blush-700 border-blush-100")}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>

                    {/* Eye */}
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); setDetail(row); }}
                        className="h-7 w-7 rounded-full bg-blush-50 flex items-center justify-center text-ink-400 hover:bg-blush-100 hover:text-blush-600 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-center text-[11px] text-ink-300">
          {filtered.length} transaksi · Revenue {idr(filtered.reduce((a, r) => a + r.revenue, 0))} ·
          Profit {idr(filtered.reduce((a, r) => a + r.profit, 0))}
        </p>
      )}

      {/* Detail modal */}
      {detail && <DetailModal row={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
