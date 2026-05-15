// ================================================================
// Blush Petals.id — TypeScript types
// ================================================================

// ── Enums ────────────────────────────────────────────────────────

export type ProductCategory =
  | "artificial-bouquet"
  | "premium-collection"
  | "fresh-flower"
  | "custom";

export type StockStatus = "tersedia" | "preorder" | "sold-out";

export type ProductStatus = "available" | "sold_out" | "hidden";

export type OrderStatus = "pending" | "accepted" | "rejected" | "completed";

// ── Product ───────────────────────────────────────────────────────
// `name` maps to the `title` column in the DB.
// All frontend components use `product.name`; the query mapper handles
// the title→name translation so no component changes are needed.

export interface Product {
  id: string;
  /** Maps to `title` column in DB. */
  name: string;
  slug: string;
  description: string;
  price: number;
  /** Harga modal (biaya produksi/beli). Hanya untuk admin — tidak tampil ke customer. */
  capital_price?: number;
  /** Category slug — stored directly in products.category for fast filtering. */
  category: ProductCategory;
  /** FK to categories table. */
  category_id?: string | null;
  /** Publishing/visibility status. */
  status?: ProductStatus;
  /** Legacy featured flag (kept for backward compat). */
  featured?: boolean;
  /** Inventory availability (Indonesian UI labels). */
  stock_status: StockStatus;
  /** Primary/thumbnail image URL. */
  image: string;
  /** Additional gallery images (from product_images table). */
  gallery?: string[];
  badge?: string | null;
  /** Available wrapping colour names, stored as JSON array. */
  wrapping_options?: string[];
  /** True if this product is displayed in the homepage Hero section. */
  is_hero_product?: boolean;
  /** True if this product appears in the homepage Featured Products section. */
  is_featured_home?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Category ─────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

// ── Product image ─────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_thumbnail: boolean;
  sort_order: number;
  created_at: string;
}

// ── Order ─────────────────────────────────────────────────────────

export interface Order {
  id: string;
  customer_name: string;
  whatsapp: string;
  /** Date the customer placed the order (from the form). */
  order_date: string | null;
  pickup_date: string | null;
  order_notes: string;
  wrapping: string;
  /** "ambil" = pickup in store · "gosend" = delivery. */
  delivery_method: string;
  greeting_card: string;
  status: OrderStatus;
  total_price: number;
  /** Biaya tambahan yang ditambahkan admin saat menerima pesanan (default 0). */
  extra_cost: number;
  /** Keterangan biaya tambahan, misal "Ongkir luar kota". */
  extra_cost_note: string | null;
  created_at: string;
  /** Joined from order_items (not a DB column). */
  items?: OrderItem[];
}

// ── Order item ────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  /** Joined from products (not a DB column). */
  product_name?: string;
  /** Joined from products (not a DB column). */
  product_image?: string | null;
}

// ── Homepage settings ─────────────────────────────────────────────

export interface HomepageSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  updated_at: string;
}

// ── Order form (WhatsApp checkout) ────────────────────────────────

export interface OrderForm {
  customerName: string;
  whatsapp: string;
  orderDate: string;
  pickupDate: string;
  productName: string;
  wrappingColor?: string;
  ribbonColor?: string;
  cardMessage?: string;
  note?: string;
  method: "ambil" | "diantar";
}

// ── Analytics ─────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalModal: number;
  totalProfit: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  ordersThisYear: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  bestSellers: { name: string; quantity: number; revenue: number }[];
}

// ── Display labels ────────────────────────────────────────────────

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  "artificial-bouquet": "Artificial Bouquet",
  "premium-collection": "Premium Collection",
  "fresh-flower":       "Fresh Flower Collection",
  "custom":             "Custom",
};

export const STATUS_LABEL: Record<StockStatus, string> = {
  tersedia:   "Tersedia",
  preorder:   "Pre-order",
  "sold-out": "Sold Out",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  available: "Aktif",
  sold_out:  "Habis",
  hidden:    "Disembunyikan",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   "Menunggu",
  accepted:  "Diterima",
  rejected:  "Ditolak",
  completed: "Selesai",
};
