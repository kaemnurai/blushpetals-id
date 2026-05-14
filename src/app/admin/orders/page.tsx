"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Phone, Calendar, Loader2,
  CheckCircle2, XCircle, Clock, CheckCheck,
  MessageCircle, RefreshCw, AlertCircle, Trash2,
  MapPin, Gift, StickyNote, ShoppingBag, Truck,
  Search, Package,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminGetOrders, adminUpdateOrderStatus, adminDeleteOrder } from "@/lib/supabase/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Page wrapper ──────────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <AdminShell email={email} onSignOut={signOut}>
          <OrdersContent />
        </AdminShell>
      )}
    </AdminGuard>
  );
}

// ── Constants ─────────────────────────────────────────────────────

const FILTER_LABEL: Record<OrderStatus | "all", string> = {
  all:       "Semua",
  pending:   "Menunggu",
  accepted:  "Diterima",
  completed: "Selesai",
  rejected:  "Ditolak",
};

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function orderRef(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

function fmtShort(d: string | null | undefined) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch { return null; }
}

function fmtFull(d: string) {
  try {
    return new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch { return "—"; }
}

// ── Status dot + label (compact, non-redundant) ───────────────────

const STATUS_DOT_COLOR: Record<OrderStatus, string> = {
  pending:   "bg-amber-400",
  accepted:  "bg-blue-400",
  completed: "bg-emerald-400",
  rejected:  "bg-red-400",
};

const STATUS_TEXT_COLOR: Record<OrderStatus, string> = {
  pending:   "text-amber-700",
  accepted:  "text-blue-700",
  completed: "text-emerald-700",
  rejected:  "text-red-600",
};

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-semibold",
      STATUS_TEXT_COLOR[status],
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT_COLOR[status])} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

// ── Summary stat cards ────────────────────────────────────────────

function StatChip({
  icon: Icon, label, value, dotColor, active, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; dotColor: string;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl p-3 text-left transition-all duration-150 border flex items-center gap-3",
        active
          ? "bg-gradient-to-br from-blush-500 to-blush-600 border-transparent shadow-soft"
          : "bg-white border-blush-100/70 shadow-card hover:border-blush-200 hover:shadow-premium",
      )}
    >
      <div className={cn(
        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
        active ? "bg-white/20" : "bg-blush-50",
      )}>
        <Icon className={cn("h-3.5 w-3.5", active ? "text-white" : dotColor)} />
      </div>
      <div>
        <p className={cn("text-[10px] uppercase tracking-wider font-medium", active ? "text-white/80" : "text-ink-400")}>
          {label}
        </p>
        <p className={cn("font-serif text-xl leading-none mt-0.5", active ? "text-white" : "text-ink-900")}>
          {value}
        </p>
      </div>
    </button>
  );
}

// ── Order card (3-column POS layout) ─────────────────────────────

function OrderCard({
  order, busy, onUpdateStatus, onDelete,
}: {
  order: Order; busy: string | null;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDelete: (o: Order) => void;
}) {
  const isBusy      = busy === order.id;
  const firstItem   = order.items?.[0];
  const productName = firstItem?.product_name ?? "Produk";
  const productImg  = firstItem?.product_image ?? null;
  const extraItems  = (order.items?.length ?? 0) - 1;

  const pickupDate = fmtShort(order.pickup_date);
  const orderDate  = fmtShort(order.order_date);
  const isGoSend   = order.delivery_method?.toLowerCase().includes("gosend");

  return (
    <div className="group rounded-2xl bg-white border border-blush-100/70 shadow-card overflow-hidden hover:shadow-premium hover:-translate-y-[1px] hover:border-blush-200/80 transition-all duration-200">
      <div className="flex items-stretch">

        {/* ── LEFT: Product thumbnail ── */}
        <div className="shrink-0 self-center m-3">
          <div className="relative h-[80px] w-[80px] sm:h-[88px] sm:w-[88px] rounded-xl overflow-hidden bg-cream-50 shadow-sm">
            {productImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImg}
                alt={productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.onerror = null;
                  t.src = "/images/placeholder-bouquet.svg";
                  t.className = "w-full h-full object-contain p-3 opacity-40";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blush-50">
                <Package className="h-8 w-8 text-blush-200" />
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Order info ── */}
        <div className="flex-1 py-3 pl-1 pr-3 sm:pr-0 min-w-0 flex flex-col justify-center gap-0.5">
          {/* Customer + ref */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-[14px] md:text-[15px] text-ink-900 leading-tight">
              {order.customer_name}
            </h3>
            <span className="font-mono text-[9px] text-ink-300 bg-blush-50 px-1.5 py-0.5 rounded tracking-wide">
              {orderRef(order.id)}
            </span>
          </div>

          {/* Product */}
          <p className="text-[13px] font-medium text-ink-700 line-clamp-1">
            {productName}
            {extraItems > 0 && (
              <span className="text-ink-400 font-normal"> +{extraItems} lainnya</span>
            )}
          </p>

          {/* Price */}
          <p className="text-blush-600 font-bold text-[16px] md:text-[17px] leading-none mt-0.5 mb-1">
            {formatRupiah(order.total_price)}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-400 items-center">
            {/* Phone */}
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{order.whatsapp}</span>
              <a
                href={waLink(order.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition ml-0.5"
                title="Balas via WhatsApp"
              >
                <MessageCircle className="h-2.5 w-2.5" />
              </a>
            </span>

            {/* Dates */}
            {(orderDate || pickupDate) && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {orderDate && <span>{orderDate}</span>}
                {orderDate && pickupDate && <span className="text-ink-200 mx-0.5">→</span>}
                {pickupDate && <span className="text-ink-600">{pickupDate}</span>}
              </span>
            )}

            {/* Method */}
            {order.delivery_method && (
              <span className="flex items-center gap-1">
                {isGoSend
                  ? <Truck  className="h-3 w-3 shrink-0 text-blue-400" />
                  : <MapPin className="h-3 w-3 shrink-0" />}
                {isGoSend ? "GoSend" : "Ambil"}
              </span>
            )}

            {/* Wrapping */}
            {order.wrapping && (
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3 shrink-0" />
                {order.wrapping}
              </span>
            )}
          </div>

          {/* Notes */}
          {(order.greeting_card || order.order_notes) && (
            <div className="mt-0.5 space-y-0.5">
              {order.greeting_card && (
                <p className="flex items-start gap-1 text-[11px] text-ink-400 italic line-clamp-1">
                  <Gift       className="h-3 w-3 shrink-0 mt-0.5 text-blush-300" />
                  &ldquo;{order.greeting_card}&rdquo;
                </p>
              )}
              {order.order_notes && (
                <p className="flex items-start gap-1 text-[11px] text-ink-400 italic line-clamp-1">
                  <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
                  &ldquo;{order.order_notes}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Mobile: status + actions inline */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-blush-100/50 sm:hidden">
            <StatusPill status={order.status} />
            <div className="flex items-center gap-1.5">
              <ActionRow
                order={order} isBusy={isBusy}
                onUpdateStatus={onUpdateStatus} onDelete={onDelete}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Status + actions (desktop only) ── */}
        <div className="hidden sm:flex w-[120px] shrink-0 border-l border-blush-100/50 flex-col items-center justify-between py-3 px-3 gap-2">
          {/* Status pill at top */}
          <StatusPill status={order.status} />

          {/* Action buttons stacked */}
          <div className="flex flex-col gap-1.5 w-full">
            <ActionRow
              order={order} isBusy={isBusy}
              onUpdateStatus={onUpdateStatus} onDelete={onDelete}
              vertical
            />
          </div>

          {/* Timestamp at bottom */}
          <p className="text-[9px] text-ink-300 text-center leading-tight">
            {fmtFull(order.created_at)}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Action row (shared by mobile footer + desktop right col) ──────

function ActionRow({
  order, isBusy, onUpdateStatus, onDelete, vertical = false,
}: {
  order: Order; isBusy: boolean;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDelete: (o: Order) => void;
  vertical?: boolean;
}) {
  const wrap = vertical ? "flex flex-col gap-1.5 w-full" : "flex gap-1.5 flex-wrap";
  return (
    <div className={wrap}>
      {order.status === "pending" && (
        <>
          <PosBtn
            onClick={() => onUpdateStatus(order.id, "accepted")}
            loading={isBusy} variant="accept" full={vertical}
          >
            <CheckCircle2 className="h-3 w-3" />
            Terima
          </PosBtn>
          <PosBtn
            onClick={() => onUpdateStatus(order.id, "rejected")}
            loading={isBusy} variant="reject" full={vertical}
          >
            <XCircle className="h-3 w-3" />
            Tolak
          </PosBtn>
        </>
      )}
      {order.status === "accepted" && (
        <PosBtn
          onClick={() => onUpdateStatus(order.id, "completed")}
          loading={isBusy} variant="complete" full={vertical}
        >
          <CheckCheck className="h-3 w-3" />
          Selesai
        </PosBtn>
      )}
      {(order.status === "rejected" || order.status === "completed") && (
        <PosBtn
          onClick={() => onDelete(order)}
          loading={false} variant="delete" full={vertical}
        >
          <Trash2 className="h-3 w-3" />
          {vertical && "Hapus"}
        </PosBtn>
      )}
    </div>
  );
}

// ── POS button ────────────────────────────────────────────────────

const POS_STYLES = {
  accept:   "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100",
  reject:   "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100",
  complete: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100",
  delete:   "bg-red-50 text-red-400 hover:bg-red-100 border border-red-100",
};

function PosBtn({
  children, onClick, loading, variant, full,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  variant: keyof typeof POS_STYLES;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors duration-150 disabled:opacity-50",
        full && "w-full",
        POS_STYLES[variant],
      )}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : children}
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-blush-100/70 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="h-[80px] w-[80px] rounded-xl bg-blush-50 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 bg-blush-50 rounded-full animate-pulse" />
          <div className="h-3.5 w-28 bg-blush-50 rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-blush-100/60 rounded-full animate-pulse" />
          <div className="flex gap-3">
            <div className="h-3 w-20 bg-blush-50 rounded-full animate-pulse" />
            <div className="h-3 w-16 bg-blush-50 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 items-center w-[120px] shrink-0 px-3 self-stretch justify-center border-l border-blush-50">
          <div className="h-3.5 w-16 bg-blush-50 rounded-full animate-pulse" />
          <div className="h-7 w-full bg-blush-50 rounded-full animate-pulse" />
          <div className="h-7 w-full bg-blush-50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────

function OrdersContent() {
  const [orders,        setOrders]        = React.useState<Order[]>([]);
  const [loading,       setLoading]       = React.useState(true);
  const [error,         setError]         = React.useState<string | null>(null);
  const [filter,        setFilter]        = React.useState<OrderStatus | "all">("all");
  const [search,        setSearch]        = React.useState("");
  const [busy,          setBusy]          = React.useState<string | null>(null);
  const [page,          setPage]          = React.useState(1);
  const [pendingDelete, setPendingDelete] = React.useState<Order | null>(null);
  const [deleting,      setDeleting]      = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Realtime subscription
  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const ch = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" },
        (p) => setOrders((prev) =>
          prev.map((o) =>
            o.id === (p.new as { id: string }).id
              ? { ...o, status: (p.new as { status: OrderStatus }).status }
              : o,
          ),
        ),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // Reset page on filter/search change
  React.useEffect(() => { setPage(1); }, [filter, search]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setBusy(id);
    try {
      await adminUpdateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Status diperbarui");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal update status");
    } finally {
      setBusy(null);
    }
  };

  const deleteOrder = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteOrder(pendingDelete.id);
      setOrders((prev) => prev.filter((o) => o.id !== pendingDelete.id));
      toast.success("Pesanan dihapus");
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pesanan");
    } finally {
      setDeleting(false);
    }
  };

  // ── Counts ──────────────────────────────────────────────────────
  const counts = React.useMemo(() => ({
    all:       orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    accepted:  orders.filter((o) => o.status === "accepted").length,
    completed: orders.filter((o) => o.status === "completed").length,
    rejected:  orders.filter((o) => o.status === "rejected").length,
  }), [orders]);

  const todayStr        = new Date().toISOString().slice(0, 10);
  const completedToday  = orders.filter(
    (o) => o.status === "completed" && o.created_at?.startsWith(todayStr),
  ).length;

  // ── Search + filter pipeline ─────────────────────────────────────
  const searched = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.customer_name?.toLowerCase().includes(q) ||
        o.whatsapp?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.items?.some((it) => it.product_name?.toLowerCase().includes(q)),
    );
  }, [orders, search]);

  const filtered = filter === "all"
    ? searched
    : searched.filter((o) => o.status === filter);

  const paged   = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Heading */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Manajemen</p>
          <h1 className="font-serif text-3xl text-ink-900">Pesanan</h1>
          <p className="text-sm text-ink-400 mt-1">Kelola dan proses pesanan masuk.</p>
        </div>
        <button
          type="button" onClick={load} disabled={loading}
          className="h-9 w-9 rounded-2xl border border-blush-100 bg-white flex items-center justify-center text-ink-400 hover:text-blush-600 hover:bg-blush-50 transition disabled:opacity-40"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Summary stat chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
        <StatChip
          icon={Package}       label="Total"     value={loading ? 0 : counts.all}
          dotColor="text-blush-500" active={filter === "all"} onClick={() => setFilter("all")}
        />
        <StatChip
          icon={Clock}         label="Menunggu"  value={loading ? 0 : counts.pending}
          dotColor="text-amber-500" active={filter === "pending"} onClick={() => setFilter("pending")}
        />
        <StatChip
          icon={CheckCircle2}  label="Diterima"  value={loading ? 0 : counts.accepted}
          dotColor="text-blue-500" active={filter === "accepted"} onClick={() => setFilter("accepted")}
        />
        <StatChip
          icon={CheckCheck}    label="Selesai Hari Ini" value={loading ? 0 : completedToday}
          dotColor="text-emerald-500" active={filter === "completed"} onClick={() => setFilter("completed")}
        />
        <StatChip
          icon={XCircle}       label="Ditolak"   value={loading ? 0 : counts.rejected}
          dotColor="text-red-400" active={filter === "rejected"} onClick={() => setFilter("rejected")}
        />
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama customer, produk, WhatsApp, atau ID pesanan..."
          className="w-full h-11 pl-11 pr-10 rounded-full text-[13px] text-ink-900 placeholder:text-ink-300 bg-white border border-blush-100/80 shadow-card focus:outline-none focus:border-blush-300 focus:shadow-soft transition-all duration-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 hover:bg-blush-200 transition"
            aria-label="Hapus pencarian"
          >
            <XCircle className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Active filter / search context label ── */}
      {!loading && (filter !== "all" || search) && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] text-ink-500">
            {filter !== "all" && (
              <span>
                Menampilkan pesanan:{" "}
                <span className="font-semibold text-ink-800">{FILTER_LABEL[filter]}</span>
              </span>
            )}
            {filter !== "all" && search && <span className="text-ink-300 mx-1.5">·</span>}
            {search && (
              <span>
                {filtered.length} hasil untuk &ldquo;
                <span className="font-medium text-ink-700">{search}</span>
                &rdquo;
              </span>
            )}
          </p>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[11px] text-blush-500 hover:text-blush-700 font-medium transition"
            >
              Tampilkan semua
            </button>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : paged.length === 0 ? (
        <div className="rounded-3xl bg-white border border-blush-100 py-16 px-8 text-center">
          <div className="h-16 w-16 rounded-3xl bg-blush-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-blush-200" />
          </div>
          <p className="font-serif text-lg text-ink-700 mb-1">Belum ada pesanan</p>
          <p className="text-sm text-ink-400">
            {search
              ? `Tidak ada pesanan yang cocok dengan "${search}".`
              : filter === "all"
              ? "Pesanan baru akan tampil di sini secara realtime."
              : `Tidak ada pesanan dengan status "${FILTER_LABEL[filter]}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {paged.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              busy={busy}
              onUpdateStatus={updateStatus}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-blush-200 bg-white text-sm text-ink-600 hover:bg-blush-50 hover:text-blush-700 transition"
          >
            Muat lebih banyak
            <span className="text-[11px] text-ink-400">({filtered.length - paged.length} lagi)</span>
          </button>
        </div>
      )}

      {/* ── Count ── */}
      {!loading && filtered.length > 0 && (
        <p className="mt-4 text-center text-[11px] text-ink-300">
          {paged.length} dari {filtered.length} pesanan
        </p>
      )}

      {/* ── Delete confirmation modal ── */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-premium p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-serif text-base text-ink-900">Hapus Pesanan?</p>
                <p className="text-[12px] text-ink-400 mt-0.5">
                  Pesanan dari{" "}
                  <span className="font-medium text-ink-700">{pendingDelete.customer_name}</span>{" "}
                  akan dihapus permanen dan tidak dapat dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="h-9 px-4 rounded-full text-[13px] font-medium border border-blush-100 bg-white text-ink-600 hover:bg-blush-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={deleteOrder}
                disabled={deleting}
                className="h-9 px-4 rounded-full text-[13px] font-medium bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
