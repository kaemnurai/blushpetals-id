"use client";

import { getSupabaseBrowserClient } from "./client";
import type { AnalyticsSummary } from "@/lib/types";

function sb() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

function startOf(unit: "week" | "month" | "year"): string {
  const now = new Date();
  if (unit === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (unit === "month") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

// Safe extra_cost reader — returns 0 if column does not exist yet
function safeExtraCost(row: Record<string, unknown>): number {
  return Number(row.extra_cost ?? 0);
}

type OrderRow = {
  id: string;
  total_price: number;
  extra_cost: number;
  status: string;
  created_at: string;
};

type ItemRow = {
  product_id: string | null;
  quantity:   number;
  price:      number;
  order_id:   string;
  products:   { title?: string; capital_price?: number } | null;
};

// Orders count as billable only if accepted or completed.
function isBillable(o: OrderRow) {
  return o.status === "accepted" || o.status === "completed";
}

// ── Safe orders query: tries with extra_cost, falls back without ──
async function fetchOrdersSafe(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  select = "id, total_price, extra_cost, status, created_at",
  fallbackSelect = "id, total_price, status, created_at",
): Promise<OrderRow[]> {
  const { data, error } = await supabase.from("orders").select(select);
  if (!error) return ((data ?? []) as Record<string, unknown>[]).map(r => ({
    id:          String(r.id ?? ""),
    total_price: Number(r.total_price ?? 0),
    extra_cost:  safeExtraCost(r),
    status:      String(r.status ?? ""),
    created_at:  String(r.created_at ?? ""),
  }));

  // extra_cost column may not exist — retry without it
  const isSchemaErr = error.message.includes("extra_cost") ||
    error.message.includes("schema cache") || error.message.includes("Could not find");
  if (!isSchemaErr) throw new Error(error.message);

  const { data: d2, error: e2 } = await supabase.from("orders").select(fallbackSelect);
  if (e2) throw new Error(e2.message);
  return ((d2 ?? []) as Record<string, unknown>[]).map(r => ({
    id:          String(r.id ?? ""),
    total_price: Number(r.total_price ?? 0),
    extra_cost:  0,
    status:      String(r.status ?? ""),
    created_at:  String(r.created_at ?? ""),
  }));
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = sb();

  const all = await fetchOrdersSafe(supabase);
  const billable = all.filter(isBillable);

  const weekStart  = startOf("week");
  const monthStart = startOf("month");
  const yearStart  = startOf("year");

  const inPeriod = (o: OrderRow, from: string) => new Date(o.created_at) >= new Date(from);
  const revenue  = (arr: OrderRow[]) => arr.reduce((acc, o) => acc + (o.total_price || 0) + (o.extra_cost || 0), 0);

  const thisWeek  = billable.filter((o) => inPeriod(o, weekStart));
  const thisMonth = billable.filter((o) => inPeriod(o, monthStart));
  const thisYear  = billable.filter((o) => inPeriod(o, yearStart));

  // Best sellers + modal — try with capital_price, fall back without
  const sellerMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  const orderModalMap = new Map<string, number>();
  const billableIds = billable.map((o) => o.id);

  if (billableIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity, price, order_id, products(title, capital_price)")
      .in("order_id", billableIds);

    for (const item of (items ?? []) as ItemRow[]) {
      if (!item.product_id) continue;
      const name    = item.products?.title ?? "Produk dihapus";
      const qty     = Number(item.quantity) || 1;
      const rev     = (Number(item.price) || 0) * qty;
      const capUnit = Number(item.products?.capital_price ?? 0);
      const modal   = capUnit * qty;

      orderModalMap.set(item.order_id, (orderModalMap.get(item.order_id) ?? 0) + modal);

      const ex = sellerMap.get(item.product_id);
      if (ex) { ex.quantity += qty; ex.revenue += rev; }
      else    { sellerMap.set(item.product_id, { name, quantity: qty, revenue: rev }); }
    }
  }

  const totalModal  = billable.reduce((acc, o) => acc + (orderModalMap.get(o.id) ?? 0), 0);
  const totalRev    = revenue(billable);

  const bestSellers = Array.from(sellerMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalOrders:      billable.length,
    totalRevenue:     totalRev,
    totalModal,
    totalProfit:      totalRev - totalModal,
    ordersThisWeek:   thisWeek.length,
    ordersThisMonth:  thisMonth.length,
    ordersThisYear:   thisYear.length,
    revenueThisWeek:  revenue(thisWeek),
    revenueThisMonth: revenue(thisMonth),
    revenueThisYear:  revenue(thisYear),
    bestSellers,
  };
}

export interface MonthlyData {
  label:   string;
  orders:  number;
  revenue: number;
  profit:  number;
}

export async function getMonthlyBreakdown(): Promise<MonthlyData[]> {
  const supabase = sb();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const orders = await fetchOrdersSafe(
    supabase,
    "id, total_price, extra_cost, created_at, status",
    "id, total_price, created_at, status",
  );

  const billableOrders = orders.filter(o => o.status === "accepted" || o.status === "completed");
  const billableIds    = billableOrders.map(o => o.id);

  // Build modal map per order
  const orderModalMap = new Map<string, number>();
  if (billableIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity, products(capital_price)")
      .in("order_id", billableIds);
    for (const it of (items ?? []) as { order_id: string; quantity: number; products: { capital_price?: number } | null }[]) {
      const modal = Number(it.products?.capital_price ?? 0) * (Number(it.quantity) || 1);
      orderModalMap.set(it.order_id, (orderModalMap.get(it.order_id) ?? 0) + modal);
    }
  }

  const months: Record<string, MonthlyData> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = { label: d.toLocaleString("id-ID", { month: "short" }), orders: 0, revenue: 0, profit: 0 };
  }

  for (const o of billableOrders) {
    const d   = new Date(o.created_at);
    if (d < sixMonthsAgo) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!months[key]) continue;
    const rev   = (o.total_price || 0) + (o.extra_cost || 0);
    const modal = orderModalMap.get(o.id) ?? 0;
    months[key].orders  += 1;
    months[key].revenue += rev;
    months[key].profit  += rev - modal;
  }

  return Object.values(months);
}
