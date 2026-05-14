"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  TrendingUp, TrendingDown, ShoppingCart, Wallet,
  Package, RefreshCw, AlertCircle, CheckCheck,
  Users, BarChart3, Star, ChevronDown, MessageCircle,
  Calendar, Clock, CalendarDays,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Page ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <AdminShell email={email} onSignOut={signOut}>
          <AnalyticsContent />
        </AdminShell>
      )}
    </AdminGuard>
  );
}

// ── Types ─────────────────────────────────────────────────────────

type Period     = "today" | "7d" | "30d" | "month" | "year";
type ProdTab    = "terlaris" | "revenue" | "growth";

interface OrderRaw {
  id: string; status: string; total_price: number;
  created_at: string; customer_name: string;
  whatsapp: string; wrapping: string; pickup_date: string | null;
}
interface ItemRaw {
  order_id: string; product_id: string | null;
  quantity: number; price: number;
  product_name: string; product_image: string | null;
}
interface ProductStat {
  id: string; name: string; image: string | null;
  qty: number; rev: number; growth: number | null;
}
interface CustomerStat {
  whatsapp: string; name: string;
  orderCount: number; revenue: number;
  lastOrderDate: string; lastStatus: string;
}
interface TxRow {
  id: string; customer_name: string; status: string;
  total_price: number; created_at: string;
  product_name: string; product_image: string | null;
}
interface ChartPoint { label: string; revenue: number; orders: number; }

// ── Constants ─────────────────────────────────────────────────────

const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "today", label: "Hari Ini"  },
  { key: "7d",    label: "7 Hari"    },
  { key: "30d",   label: "30 Hari"   },
  { key: "month", label: "Bulan Ini" },
  { key: "year",  label: "Tahun Ini" },
];

const PREV_LBL: Record<Period, string> = {
  today: "kemarin", "7d": "7h lalu", "30d": "30h lalu",
  month: "bulan lalu", year: "tahun lalu",
};

// ── Helpers ───────────────────────────────────────────────────────

/** Full Indonesian format: Rp 50.000 / Rp 2.450.000 */
const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);

/** Short format used only for Y-axis labels */
const axisLabel = (n: number): string => {
  if (n === 0) return "0";
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

const growthPct = (curr: number, prev: number): number | null => {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
};

const maskWA = (wa: string) => {
  const c = wa.replace(/\D/g, "");
  if (c.length < 8) return wa;
  return `${c.slice(0, 4)} ${c.slice(4, 8)} xxxx`;
};

const fmtDate = (d: string, short = false) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", ...(short ? {} : { year: "numeric" }),
  });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

function getPeriodBounds(p: Period) {
  const now  = new Date();
  const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const spans: Record<Period, number> = {
    today: 1, "7d": 7, "30d": 30,
    month: day0.getDate(),
    year:  Math.floor((day0.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1,
  };
  const starts: Record<Period, Date> = {
    today: day0,
    "7d":  new Date(day0.getTime() - 6 * 86400000),
    "30d": new Date(day0.getTime() - 29 * 86400000),
    month: new Date(now.getFullYear(), now.getMonth(), 1),
    year:  new Date(now.getFullYear(), 0, 1),
  };
  return { start: starts[p], prevStart: new Date(starts[p].getTime() - spans[p] * 86400000), prevEnd: starts[p], days: spans[p] };
}

function buildChartPts(orders: OrderRaw[], period: Period): ChartPoint[] {
  const bill = orders.filter(o => o.status === "accepted" || o.status === "completed");
  const { start } = getPeriodBounds(period);
  const now = new Date();
  const bkt = (s: Date, e: Date, label: string): ChartPoint => {
    const r = bill.filter(o => { const d = new Date(o.created_at); return d >= s && d < e; });
    return { label, revenue: r.reduce((a, o) => a + o.total_price, 0), orders: r.length };
  };
  if (period === "today") {
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Array.from({ length: now.getHours() + 1 }, (_, h) =>
      bkt(new Date(d0.getTime() + h * 3600000), new Date(d0.getTime() + (h + 1) * 3600000), `${String(h).padStart(2,"0")}h`));
  }
  if (period === "7d") {
    const dn = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    return Array.from({ length: 7 }, (_, i) => { const s = new Date(start.getTime() + i * 86400000); return bkt(s, new Date(s.getTime() + 86400000), dn[s.getDay()]); });
  }
  if (period === "30d") {
    return Array.from({ length: 30 }, (_, i) => { const s = new Date(start.getTime() + i * 86400000); return bkt(s, new Date(s.getTime() + 86400000), String(s.getDate())); });
  }
  if (period === "month") {
    return Array.from({ length: now.getDate() }, (_, i) => { const s = new Date(now.getFullYear(), now.getMonth(), i + 1); return bkt(s, new Date(s.getTime() + 86400000), String(i + 1)); });
  }
  const ml = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return Array.from({ length: 12 }, (_, i) =>
    bkt(new Date(now.getFullYear(), i, 1), new Date(now.getFullYear(), i + 1, 1), ml[i]));
}

function svgPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const sp = (pts[i].x - pts[i - 1].x) / 3;
    d += ` C ${pts[i-1].x+sp} ${pts[i-1].y} ${pts[i].x-sp} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

// ── Shared micro-components ───────────────────────────────────────

function Skel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("bg-blush-50/80 rounded-2xl animate-pulse", className)} style={style} />;
}

function Empty({ icon: Icon, text }: { icon: React.ComponentType<{className?:string}>; text: string }) {
  return (
    <div className="py-10 flex flex-col items-center gap-2">
      <div className="h-12 w-12 rounded-3xl bg-blush-50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blush-200" />
      </div>
      <p className="text-[12px] text-ink-400">{text}</p>
    </div>
  );
}

function Growth({ pct, label }: { pct: number | null; label?: string }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold",
      up ? "text-emerald-500" : "text-red-500")}>
      {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {up ? "+" : ""}{pct}%{label && <span className="text-[10px] font-normal text-ink-400 ml-0.5">{label}</span>}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accepted:  "bg-blue-50 text-blue-700 border-blue-100",
    pending:   "bg-amber-50 text-amber-700 border-amber-100",
    rejected:  "bg-red-50 text-red-600 border-red-100",
  };
  const lbl: Record<string, string> = {
    completed:"Selesai", accepted:"Diterima", pending:"Menunggu", rejected:"Ditolak",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
      map[status] ?? "bg-blush-50 text-blush-700 border-blush-100")}>
      {lbl[status] ?? status}
    </span>
  );
}

// ── Trend Chart with HTML Y-axis ──────────────────────────────────

function TrendChart({ data }: { data: ChartPoint[] }) {
  const [hi, setHi] = React.useState<number | null>(null);
  const CW = 500, CH = 160;
  const CP = { l: 4, r: 8, t: 12, b: 24 };
  const IW = CW - CP.l - CP.r, IH = CH - CP.t - CP.b;

  const maxR   = Math.max(...data.map(d => d.revenue), 1);
  const niceMax = Math.ceil(maxR / 250000) * 250000 || 1000000;
  const allZ   = data.every(d => d.revenue === 0);
  const yTicks  = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25];

  if (allZ) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center gap-2">
        <TrendingUp className="h-8 w-8 text-blush-200" />
        <p className="text-[12px] text-ink-400">Belum ada data revenue untuk periode ini.</p>
      </div>
    );
  }

  const pts = data.map((d, i) => ({
    x: CP.l + (data.length > 1 ? (i / (data.length - 1)) * IW : IW / 2),
    y: CP.t + IH - (d.revenue / niceMax) * IH,
  }));
  const line = svgPath(pts);
  const area = line ? `${line} L ${pts.at(-1)!.x} ${CP.t + IH} L ${pts[0].x} ${CP.t + IH} Z` : "";
  const every = data.length <= 7 ? 1 : data.length <= 14 ? 2 : Math.ceil(data.length / 10);

  return (
    <div className="flex">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between pr-2 pb-6 shrink-0" style={{ width: 44 }}>
        {yTicks.map(t => (
          <span key={t} className="text-[9px] text-ink-400 text-right block leading-none">{axisLabel(t)}</span>
        ))}
        <span className="text-[9px] text-ink-400 text-right block leading-none">0</span>
      </div>

      {/* Chart SVG */}
      <div className="flex-1 min-w-0">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" style={{ height: 180 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e34d7c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#e34d7c" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[...yTicks, 0].map((t, i) => {
            const y = i < yTicks.length
              ? CP.t + IH - (t / niceMax) * IH
              : CP.t + IH;
            return <line key={t} x1={CP.l} x2={CW - CP.r} y1={y} y2={y}
              stroke="#f0d4dc" strokeWidth="0.8" />;
          })}
          {/* Area */}
          {area && <path d={area} fill="url(#tg)" />}
          {/* Hover line */}
          {hi !== null && pts[hi] && (
            <line x1={pts[hi].x} x2={pts[hi].x} y1={CP.t} y2={CP.t + IH}
              stroke="#e34d7c" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
          )}
          {/* Line */}
          {line && <path d={line} fill="none" stroke="#e34d7c" strokeWidth="2.5" strokeLinecap="round" />}
          {/* Points + hit targets */}
          {pts.map((p, i) => (
            <g key={i}>
              <rect x={p.x - IW / (data.length * 2)} y={0} width={IW / data.length} height={CH}
                fill="transparent"
                onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} />
              <circle cx={p.x} cy={p.y} r={hi === i ? 5.5 : 3.5} fill="white"
                stroke={hi === i ? "#bd3a64" : "#e34d7c"} strokeWidth={hi === i ? 2.5 : 2} />
              {hi === i && (
                <g>
                  <rect x={Math.min(Math.max(p.x - 52, CP.l), CW - CP.r - 104)}
                    y={Math.max(p.y - 46, CP.t)} width={104} height={36} rx="6"
                    fill="#2a1f24" fillOpacity="0.9" />
                  <text x={Math.min(Math.max(p.x, CP.l + 52), CW - CP.r - 52)}
                    y={Math.max(p.y - 31, CP.t + 14)} textAnchor="middle" fontSize="9.5" fill="white" fontWeight="700">
                    {idr(data[i].revenue)}
                  </text>
                  <text x={Math.min(Math.max(p.x, CP.l + 52), CW - CP.r - 52)}
                    y={Math.max(p.y - 17, CP.t + 27)} textAnchor="middle" fontSize="8.5" fill="#ffb3c6">
                    {data[i].orders} order
                  </text>
                </g>
              )}
            </g>
          ))}
          {/* X labels */}
          {data.map((d, i) => (i % every !== 0 && i !== data.length - 1) ? null : (
            <text key={i} x={pts[i].x} y={CH - 5} textAnchor="middle" fontSize="9" fill="#a6818c">{d.label}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Analytics content ─────────────────────────────────────────────

function AnalyticsContent() {
  const [rawOrders, setRawOrders] = React.useState<OrderRaw[]>([]);
  const [rawItems,  setRawItems]  = React.useState<ItemRaw[]>([]);
  const [period,    setPeriod]    = React.useState<Period>("month");
  const [loading,   setLoading]   = React.useState(true);
  const [error,     setError]     = React.useState<string | null>(null);
  const [prodTab,   setProdTab]   = React.useState<ProdTab>("terlaris");
  const [showAllC,  setShowAllC]  = React.useState(false);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [ordRes, itmRes] = await Promise.all([
        supabase.from("orders")
          .select("id, status, total_price, created_at, customer_name, whatsapp, wrapping, pickup_date")
          .order("created_at", { ascending: false }),
        supabase.from("order_items")
          .select("order_id, product_id, quantity, price, products(title, image)"),
      ]);
      if (ordRes.error) throw new Error(ordRes.error.message);
      if (itmRes.error) throw new Error(itmRes.error.message);
      setRawOrders((ordRes.data ?? []) as OrderRaw[]);
      setRawItems(((itmRes.data ?? []) as Record<string, unknown>[]).map(it => ({
        order_id:      String(it.order_id ?? ""),
        product_id:    (it.product_id as string | null) ?? null,
        quantity:      Number(it.quantity ?? 1),
        price:         Number(it.price ?? 0),
        product_name:  (it.products as {title?:string}|null)?.title ?? "Produk dihapus",
        product_image: (it.products as {title?:string;image?:string}|null)?.image ?? null,
      })));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat analitik";
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const C = React.useMemo(() => {
    const bill = rawOrders.filter(o => o.status === "accepted" || o.status === "completed");
    const { start, prevStart, prevEnd, days } = getPeriodBounds(period);
    const sum = (a: OrderRaw[]) => a.reduce((s, o) => s + o.total_price, 0);

    const curBill  = bill.filter(o => new Date(o.created_at) >= start);
    const prevBill = bill.filter(o => { const d = new Date(o.created_at); return d >= prevStart && d < prevEnd; });

    const curRev = sum(curBill), prevRev = sum(prevBill);
    const curOrd = curBill.length, prevOrd = prevBill.length;
    const aov    = curOrd > 0 ? curRev / curOrd : 0;
    const prevAov = prevOrd > 0 ? prevRev / prevOrd : 0;
    const completed     = curBill.filter(o => o.status === "completed").length;
    const prevCompleted = prevBill.filter(o => o.status === "completed").length;
    const avgPerDay     = days > 0 ? Math.round(curRev / days) : 0;
    const avgOrdPerDay  = days > 0 ? (curOrd / days).toFixed(1) : "0";

    const periodIds = new Set(curBill.map(o => o.id));
    const prevIds   = new Set(prevBill.map(o => o.id));
    const prodsSold = new Set(rawItems.filter(it => it.product_id && periodIds.has(it.order_id)).map(it => it.product_id));

    const nameCnt = new Map<string, number>();
    bill.forEach(o => nameCnt.set(o.customer_name, (nameCnt.get(o.customer_name)||0)+1));
    const uniqueC = nameCnt.size;
    const repeatC = Array.from(nameCnt.values()).filter(c => c > 1).length;

    const chartPoints = buildChartPts(rawOrders, period);

    // Revenue summary with comparisons
    const now = new Date();
    const ws  = (() => { const d = new Date(now); d.setDate(now.getDate()-((now.getDay()+6)%7)); d.setHours(0,0,0,0); return d; })();
    const ms  = new Date(now.getFullYear(), now.getMonth(), 1);
    const ys  = new Date(now.getFullYear(), 0, 1);
    const wRev  = sum(bill.filter(o=>new Date(o.created_at)>=ws));
    const mRev  = sum(bill.filter(o=>new Date(o.created_at)>=ms));
    const yRev  = sum(bill.filter(o=>new Date(o.created_at)>=ys));
    const wOrd  = bill.filter(o=>new Date(o.created_at)>=ws).length;
    const mOrd  = bill.filter(o=>new Date(o.created_at)>=ms).length;
    const yOrd  = bill.filter(o=>new Date(o.created_at)>=ys).length;
    const pwRev = sum(bill.filter(o=>{const d=new Date(o.created_at);return d>=new Date(ws.getTime()-7*86400000)&&d<ws;}));
    const pmRev = sum(bill.filter(o=>{const d=new Date(o.created_at);return d>=new Date(now.getFullYear(),now.getMonth()-1,1)&&d<ms;}));
    const pyRev = sum(bill.filter(o=>{const d=new Date(o.created_at);return d>=new Date(now.getFullYear()-1,0,1)&&d<ys;}));
    const pAvgPerDay = days > 0 ? Math.round(prevRev / days) : 0;

    const sumRows = [
      { label:"Minggu Ini",       icon: Calendar,     iconBg:"bg-pink-50",   iconColor:"text-pink-400",    revenue:wRev,       orders:wOrd,  ordLabel:`${wOrd} order`,   growth:growthPct(wRev,pwRev) },
      { label:"Bulan Ini",        icon: CalendarDays,  iconBg:"bg-rose-50",   iconColor:"text-rose-400",    revenue:mRev,       orders:mOrd,  ordLabel:`${mOrd} order`,   growth:growthPct(mRev,pmRev) },
      { label:"Tahun Ini",        icon: TrendingUp,    iconBg:"bg-emerald-50",iconColor:"text-emerald-500", revenue:yRev,       orders:yOrd,  ordLabel:`${yOrd} order`,   growth:growthPct(yRev,pyRev) },
      { label:"Rata-rata per Hari",icon: Clock,        iconBg:"bg-blue-50",   iconColor:"text-blue-400",    revenue:avgPerDay,  orders:0,     ordLabel:`${avgOrdPerDay} order`, growth:growthPct(avgPerDay,pAvgPerDay) },
    ];

    // Products
    const selMap  = new Map<string,{name:string;image:string|null;qty:number;rev:number}>();
    const pSelMap = new Map<string,{qty:number;rev:number}>();
    rawItems.forEach(it => {
      if (!it.product_id) return;
      const r = it.price * it.quantity;
      if (periodIds.has(it.order_id)) { const ex=selMap.get(it.product_id); if(ex){ex.qty+=it.quantity;ex.rev+=r;}else selMap.set(it.product_id,{name:it.product_name,image:it.product_image,qty:it.quantity,rev:r}); }
      if (prevIds.has(it.order_id))   { const ex=pSelMap.get(it.product_id); if(ex){ex.qty+=it.quantity;ex.rev+=r;}else pSelMap.set(it.product_id,{qty:it.quantity,rev:r}); }
    });
    const allProducts: ProductStat[] = Array.from(selMap.entries())
      .map(([id,s]) => ({...s, id, growth:growthPct(s.rev, pSelMap.get(id)?.rev??0)}));

    // Customers
    const custMap = new Map<string,CustomerStat>();
    bill.forEach(o => {
      const ex = custMap.get(o.whatsapp);
      if (ex) { ex.orderCount++; ex.revenue+=o.total_price; if(o.created_at>ex.lastOrderDate){ex.lastOrderDate=o.created_at;ex.lastStatus=o.status;ex.name=o.customer_name;} }
      else custMap.set(o.whatsapp,{whatsapp:o.whatsapp,name:o.customer_name,orderCount:1,revenue:o.total_price,lastOrderDate:o.created_at,lastStatus:o.status});
    });
    const allCustomers = Array.from(custMap.values()).sort((a,b)=>b.orderCount-a.orderCount||b.revenue-a.revenue);

    // Recent transactions (last 5 billable in period)
    const recentTx: TxRow[] = curBill.slice(0, 5).map(o => ({
      id: o.id, customer_name: o.customer_name, status: o.status,
      total_price: o.total_price, created_at: o.created_at,
      product_name:  rawItems.find(it=>it.order_id===o.id)?.product_name ?? "—",
      product_image: rawItems.find(it=>it.order_id===o.id)?.product_image ?? null,
    }));

    return {
      curRev, prevRev, curOrd, prevOrd, aov, prevAov,
      completed, prevCompleted, produkTerjual:prodsSold.size,
      uniqueC, repeatC, avgPerDay, days,
      chartPoints, sumRows, allProducts, allCustomers, recentTx,
      prevLabel: PREV_LBL[period],
    };
  }, [rawOrders, rawItems, period]);

  // Sorted products per tab
  const sortedProds = React.useMemo((): ProductStat[] => {
    const arr = [...C.allProducts];
    if (prodTab === "terlaris") return arr.sort((a,b)=>b.qty-a.qty).slice(0,5);
    if (prodTab === "revenue")  return arr.sort((a,b)=>b.rev-a.rev).slice(0,5);
    return arr.filter(p=>p.growth!==null).sort((a,b)=>(b.growth??-999)-(a.growth??-999)).slice(0,5);
  }, [C.allProducts, prodTab]);

  const topBarVal = sortedProds[0]
    ? prodTab==="terlaris" ? sortedProds[0].qty : prodTab==="revenue" ? sortedProds[0].rev : (sortedProds[0].growth??0)
    : 1;

  const shownC = showAllC ? C.allCustomers : C.allCustomers.slice(0, 5);
  const aPal   = ["bg-blush-100 text-blush-700","bg-purple-100 text-purple-700","bg-emerald-100 text-emerald-700","bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"];

  // Date range label for header
  const dateRange = (() => {
    const now = new Date();
    const { start } = getPeriodBounds(period);
    if (period === "today") return fmtDate(now.toISOString());
    return `${fmtDate(start.toISOString(), true)} - ${fmtDate(now.toISOString())}`;
  })();

  const kpis = [
    { icon:Wallet,       iconBg:"bg-purple-50", iconColor:"text-purple-500", label:"TOTAL REVENUE",    value:idr(C.curRev),         growth:growthPct(C.curRev,C.prevRev)        },
    { icon:ShoppingCart, iconBg:"bg-pink-50",   iconColor:"text-pink-500",   label:"TOTAL ORDER",      value:String(C.curOrd),       growth:growthPct(C.curOrd,C.prevOrd)        },
    { icon:BarChart3,    iconBg:"bg-blue-50",   iconColor:"text-blue-500",   label:"AVG ORDER VALUE",  value:idr(C.aov),             growth:growthPct(C.aov,C.prevAov)           },
    { icon:CheckCheck,   iconBg:"bg-emerald-50",iconColor:"text-emerald-500",label:"ORDER SELESAI",    value:String(C.completed),    growth:growthPct(C.completed,C.prevCompleted)},
    { icon:Users,        iconBg:"bg-rose-50",   iconColor:"text-rose-500",   label:"REPEAT CUSTOMER",  value:String(C.repeatC),      growth:null                                  },
    { icon:Star,         iconBg:"bg-amber-50",  iconColor:"text-amber-500",  label:"PRODUK TERJUAL",   value:String(C.produkTerjual),growth:null                                  },
  ];

  return (
    <div className="space-y-5">

      {/* ════════ HEADER ════════ */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Laporan</p>
          <h1 className="font-serif text-3xl text-ink-900">Analitik</h1>
          <p className="text-[13px] text-ink-400 mt-1.5">
            Semua data dihitung dari pesanan berstatus{" "}
            <span className="text-emerald-600 font-medium">Diterima</span>
            {" "}&{" "}
            <span className="text-emerald-600 font-medium">Selesai</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range display */}
          <div className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-blush-100/70 shadow-card text-[12px] text-ink-600 cursor-default select-none">
            <Calendar className="h-3.5 w-3.5 text-blush-400 shrink-0" />
            <span>{dateRange}</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </div>
          {/* Refresh */}
          <button type="button" onClick={load} disabled={loading}
            className="h-9 w-9 rounded-xl bg-white border border-blush-100/70 shadow-card flex items-center justify-center text-ink-400 hover:text-blush-600 hover:bg-blush-50 transition disabled:opacity-40"
            aria-label="Refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ════════ PERIOD FILTER ════════ */}
      <div className="flex items-center gap-1 p-1 bg-white border border-blush-100/70 rounded-full shadow-card w-fit overflow-x-auto max-w-full scrollbar-hide">
        {PERIOD_TABS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setPeriod(key)}
            className={cn("px-4 h-8 rounded-full text-[12px] font-medium transition-all duration-200 shrink-0 whitespace-nowrap",
              period === key
                ? "bg-blush-500 text-white shadow-soft"
                : "text-ink-500 hover:text-blush-600 hover:bg-blush-50/60")}>
            {label}
          </button>
        ))}
        <button className="px-4 h-8 rounded-full text-[12px] font-medium text-ink-400 hover:text-blush-600 hover:bg-blush-50/60 transition-all shrink-0">
          Custom
        </button>
      </div>

      {/* ════════ KPI CARDS ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {loading
          ? Array.from({length:6}).map((_,i) => <Skel key={i} style={{height:104}} />)
          : kpis.map((k, i) => (
            <div key={i} className="rounded-2xl bg-white border border-blush-100/60 p-4 shadow-[0_1px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2.5">
                <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", k.iconBg)}>
                  <k.icon className={cn("h-3.5 w-3.5", k.iconColor)} />
                </div>
                <p className="text-[9px] font-semibold tracking-[0.12em] text-ink-400 uppercase leading-none">{k.label}</p>
              </div>
              <p className="font-serif text-[20px] font-bold text-ink-900 leading-tight truncate mb-1.5">{k.value}</p>
              <div className="flex items-center gap-1.5">
                <Growth pct={k.growth} />
                {k.growth !== null && <span className="text-[10px] text-ink-400">vs {C.prevLabel}</span>}
              </div>
            </div>
          ))
        }
      </div>

      {/* ════════ TREND CHART + REVENUE SUMMARY ════════ */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Trend Revenue */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-blush-100/60 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div>
              <p className="font-semibold text-[14px] text-ink-900 mb-0.5">Trend Revenue</p>
              <p className="text-[11px] text-ink-400">Diterima + Selesai</p>
            </div>
            {!loading && (
              <div className="text-right">
                <p className="text-[10px] text-ink-400 mb-0.5">Total Revenue</p>
                <p className="font-serif text-xl font-bold text-ink-900 leading-tight">{idr(C.curRev)}</p>
                <Growth pct={growthPct(C.curRev, C.prevRev)} label={` vs ${C.prevLabel}`} />
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            {loading ? <Skel style={{height:180}} /> : <TrendChart data={C.chartPoints} />}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="rounded-2xl bg-white border border-blush-100/60 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
          <p className="font-semibold text-[14px] text-ink-900 mb-4">Revenue Summary</p>
          {loading ? (
            <div className="space-y-4">{Array.from({length:4}).map((_,i) => <Skel key={i} style={{height:40}} />)}</div>
          ) : (
            <div className="divide-y divide-blush-100/60">
              {C.sumRows.map(row => (
                <div key={row.label} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", row.iconBg)}>
                    <row.icon className={cn("h-4 w-4", row.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-ink-700 leading-tight">{row.label}</p>
                    <p className="text-[11px] text-ink-400">{row.ordLabel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-ink-900">{idr(row.revenue)}</p>
                    <Growth pct={row.growth} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════ BOTTOM 3-COLUMN GRID ════════ */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Product Performance */}
        <div className="rounded-2xl bg-white border border-blush-100/60 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[14px] text-ink-900">Product Performance</p>
            <button className="text-[11px] text-blush-500 hover:text-blush-700 font-medium transition flex items-center gap-0.5">
              Lihat semua <span className="text-[10px]">→</span>
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {(["terlaris","revenue","growth"] as ProdTab[]).map(t => (
              <button key={t} type="button" onClick={() => setProdTab(t)}
                className={cn("px-3 h-7 rounded-full text-[11px] font-medium transition-all duration-150 capitalize",
                  prodTab === t
                    ? "bg-blush-500 text-white shadow-soft"
                    : "text-ink-400 hover:text-blush-600 bg-blush-50/60")}>
                {t === "terlaris" ? "Terlaris" : t === "revenue" ? "Revenue" : "Growth"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Skel key={i} style={{height:44}} />)}</div>
          ) : sortedProds.length === 0 ? (
            <Empty icon={Package} text="Belum ada data" />
          ) : (
            <div className="space-y-2.5">
              {sortedProds.map((s, i) => {
                const bv   = prodTab==="terlaris" ? s.qty : prodTab==="revenue" ? s.rev : Math.max(s.growth??0,0);
                const bmax = topBarVal > 0 ? topBarVal : 1;
                const bw   = bmax > 0 ? (bv / bmax) * 100 : 0;
                const main = prodTab==="terlaris" ? `${s.qty} terjual` : prodTab==="revenue" ? idr(s.rev) : (s.growth!==null?`${s.growth>0?"+":""}${s.growth}%`:"—");

                return (
                  <div key={s.id} className="flex items-center gap-2.5 py-0.5">
                    <span className="text-[11px] font-bold text-ink-400 w-3 shrink-0">{i+1}</span>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-cream-50 shrink-0 border border-blush-100/50">
                      {s.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="h-3.5 w-3.5 text-blush-200" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink-900 truncate">{s.name}</p>
                      <div className="h-1 bg-blush-50 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-gradient-to-r from-blush-300 to-blush-500 rounded-full transition-all duration-700"
                          style={{width:`${bw}%`}} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-semibold text-ink-900 whitespace-nowrap">{main}</p>
                      {s.growth!==null && prodTab!=="growth" && <Growth pct={s.growth} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Order Insight */}
        <div className="rounded-2xl bg-white border border-blush-100/60 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-[14px] text-ink-900">Customer Order Insight</p>
            {C.allCustomers.length > 5 && (
              <button onClick={()=>setShowAllC(p=>!p)}
                className="text-[11px] text-blush-500 hover:text-blush-700 font-medium transition flex items-center gap-0.5">
                {showAllC?"Sembunyikan":"Lihat semua →"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Skel key={i} style={{height:52}} />)}</div>
          ) : C.allCustomers.length === 0 ? (
            <Empty icon={Users} text="Belum ada data customer" />
          ) : (
            <div className="space-y-1">
              {shownC.map((c, i) => {
                const isLoyal = c.orderCount > 3;
                const isNew   = c.orderCount === 1;
                const init    = c.name.trim().split(" ").map(w=>w[0]).join("").slice(0,1).toUpperCase() || "?";
                return (
                  <div key={c.whatsapp} className="flex items-center gap-2.5 py-2.5 border-b border-blush-50 last:border-0">
                    <span className="text-[10px] font-bold text-ink-300 w-3 shrink-0">{i+1}</span>
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px]", aPal[i%aPal.length])}>
                      {init}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink-900 truncate leading-tight">{c.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MessageCircle className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                        <p className="text-[10px] text-ink-400">{maskWA(c.whatsapp)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-semibold text-ink-900">{c.orderCount} order</p>
                      <p className="text-[11px] text-blush-600 font-medium">{idr(c.revenue)}</p>
                    </div>
                    <div className="shrink-0 text-right ml-1">
                      {isLoyal && <span className="block text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full whitespace-nowrap mb-0.5">Pelanggan Loyal</span>}
                      {!isLoyal && !isNew && <span className="block text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap mb-0.5">Aktif</span>}
                      {isNew && <span className="block text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap mb-0.5">Customer Baru</span>}
                      <p className="text-[9px] text-ink-300">{fmtDate(c.lastOrderDate, true)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaksi Terbaru */}
        <div className="rounded-2xl bg-white border border-blush-100/60 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-[14px] text-ink-900">Transaksi Terbaru</p>
            <button className="text-[11px] text-blush-500 hover:text-blush-700 font-medium transition flex items-center gap-0.5">
              Lihat semua <span className="text-[10px]">→</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Skel key={i} style={{height:52}} />)}</div>
          ) : C.recentTx.length === 0 ? (
            <Empty icon={ShoppingCart} text="Belum ada transaksi" />
          ) : (
            <div className="space-y-1">
              {C.recentTx.map(o => (
                <div key={o.id} className="flex items-center gap-2.5 py-2.5 border-b border-blush-50 last:border-0">
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-cream-50 shrink-0 border border-blush-100/50">
                    {o.product_image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={o.product_image} alt={o.product_name} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="h-3.5 w-3.5 text-blush-200" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink-900 truncate leading-tight">{o.customer_name}</p>
                    <p className="text-[10px] text-ink-400 truncate">{o.product_name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={o.status} />
                    <p className="text-[9px] text-ink-400 mt-0.5">{fmtDate(o.created_at, true)}</p>
                    <p className="text-[9px] text-ink-300">{fmtTime(o.created_at)}</p>
                  </div>
                  <p className="text-[12px] font-semibold text-ink-900 shrink-0 text-right whitespace-nowrap">
                    {idr(o.total_price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
