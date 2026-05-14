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

type OrderRow = { id: string; total_price: number; status: string; created_at: string };
type ItemRow  = {
  product_id: string | null;
  quantity:   number;
  price:      number;
  order_id:   string;
  products:   { title?: string } | null;
};

// Orders count as billable (visible in analytics) only if accepted or completed.
// Pending and rejected orders are excluded from all analytics numbers.
function isBillable(o: OrderRow) {
  return o.status === "accepted" || o.status === "completed";
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = sb();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total_price, status, created_at");
  if (error) throw new Error(error.message);

  const all: OrderRow[]      = (orders ?? []) as OrderRow[];
  const billable: OrderRow[] = all.filter(isBillable);

  const weekStart  = startOf("week");
  const monthStart = startOf("month");
  const yearStart  = startOf("year");

  const inPeriod = (o: OrderRow, from: string) => new Date(o.created_at) >= new Date(from);

  const thisWeek  = billable.filter((o) => inPeriod(o, weekStart));
  const thisMonth = billable.filter((o) => inPeriod(o, monthStart));
  const thisYear  = billable.filter((o) => inPeriod(o, yearStart));

  const revenue = (arr: OrderRow[]) =>
    arr.reduce((acc, o) => acc + (o.total_price || 0), 0);

  // Best sellers — only accepted + completed orders
  const sellerMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  const billableIds = billable.map((o) => o.id);

  if (billableIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity, price, order_id, products(title)")
      .in("order_id", billableIds);

    for (const item of (items ?? []) as ItemRow[]) {
      if (!item.product_id) continue;
      const name = item.products?.title ?? "Produk dihapus";
      const qty  = Number(item.quantity) || 1;
      const rev  = (Number(item.price) || 0) * qty;
      const ex   = sellerMap.get(item.product_id);
      if (ex) { ex.quantity += qty; ex.revenue += rev; }
      else    { sellerMap.set(item.product_id, { name, quantity: qty, revenue: rev }); }
    }
  }

  const bestSellers = Array.from(sellerMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalOrders:      billable.length,
    totalRevenue:     revenue(billable),
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
}

export async function getMonthlyBreakdown(): Promise<MonthlyData[]> {
  const supabase = sb();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("orders")
    .select("total_price, created_at, status")
    .gte("created_at", sixMonthsAgo.toISOString());

  const months: Record<string, MonthlyData> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = { label: d.toLocaleString("id-ID", { month: "short" }), orders: 0, revenue: 0 };
  }

  for (const row of (data ?? []) as { total_price: number; created_at: string; status: string }[]) {
    if (row.status !== "accepted" && row.status !== "completed") continue;
    const d   = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (months[key]) {
      months[key].orders  += 1;
      months[key].revenue += row.total_price || 0;
    }
  }

  return Object.values(months);
}
