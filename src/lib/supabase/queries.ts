import { getSupabaseBrowserClient as getSupabaseServerClient, isSupabaseConfigured } from "./client";
import {
  DUMMY_PRODUCTS,
  getFeaturedProducts as getDummyFeatured,
  getProductBySlug as getDummyBySlug,
} from "@/lib/data/products";
import type { Product, ProductCategory } from "@/lib/types";

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

// ── Row → Product mapper ─────────────────────────────────────────
// DB stores the product name as `title`; we expose it as `name` so
// all existing frontend components work without modification.

export function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id:              String(row.id ?? ""),
    name:            String(row.title ?? row.name ?? ""),
    slug:            String(row.slug ?? ""),
    description:     String(row.description ?? ""),
    price:           Number(row.price ?? 0),
    category:        (row.category as ProductCategory) ?? "artificial-bouquet",
    category_id:     (row.category_id as string | null) ?? null,
    status:          (row.status as Product["status"]) ?? "available",
    featured:        Boolean(row.featured ?? false),
    stock_status:    (row.stock_status as Product["stock_status"]) ?? "tersedia",
    image:           String(row.image ?? "/images/placeholder-bouquet.svg"),
    badge:           (row.badge as string | null) ?? null,
    wrapping_options:(row.wrapping_options as string[]) ?? [],
    is_hero_product: Boolean(row.is_hero_product ?? false),
    is_featured_home:Boolean(row.is_featured_home ?? false),
    created_at:      String(row.created_at ?? ""),
    updated_at:      String(row.updated_at ?? ""),
  };
}

// ── getHeroProduct ────────────────────────────────────────────────
// Returns the single product flagged as is_hero_product = true.
// Falls back to the first dummy product if DB is empty/unconfigured.

export async function getHeroProduct(): Promise<Product | null> {
  if (!isSupabaseConfigured()) return DUMMY_PRODUCTS[0] ?? null;

  try {
    const sb = requireClient();
    const { data } = await sb
      .from("products")
      .select("*")
      .eq("is_hero_product", true)
      .single();

    return data ? rowToProduct(data as Record<string, unknown>) : (DUMMY_PRODUCTS[0] ?? null);
  } catch {
    return DUMMY_PRODUCTS[0] ?? null;
  }
}

// ── getFeaturedProducts ───────────────────────────────────────────
// Returns up to 4 products with is_featured_home = true.

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return getDummyFeatured();

  try {
    const sb = requireClient();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("is_featured_home", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) throw error;
    if (!data || data.length === 0) return getDummyFeatured();
    return (data as Record<string, unknown>[]).map(rowToProduct);
  } catch {
    return getDummyFeatured();
  }
}

// ── getProducts ───────────────────────────────────────────────────
// Returns all public products, optionally filtered by category.

export async function getProducts(category?: ProductCategory): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return category ? DUMMY_PRODUCTS.filter((p) => p.category === category) : DUMMY_PRODUCTS;
  }

  try {
    const sb = requireClient();
    let q = sb.from("products").select("*").order("created_at", { ascending: false });
    if (category) q = q.eq("category", category);

    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) {
      return category ? DUMMY_PRODUCTS.filter((p) => p.category === category) : DUMMY_PRODUCTS;
    }
    return (data as Record<string, unknown>[]).map(rowToProduct);
  } catch {
    return category ? DUMMY_PRODUCTS.filter((p) => p.category === category) : DUMMY_PRODUCTS;
  }
}

// ── getProductBySlug ──────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return getDummyBySlug(slug) ?? null;

  try {
    const sb = requireClient();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return getDummyBySlug(slug) ?? null;

    const product = rowToProduct(data as Record<string, unknown>);

    // Attach gallery images (max 3 slots, ordered by sort_order)
    const { data: imgs } = await sb
      .from("product_images")
      .select("image_url")
      .eq("product_id", product.id)
      .order("sort_order")
      .limit(3);

    if (imgs && imgs.length > 0) {
      product.gallery = (imgs as { image_url: string }[]).map((i) => i.image_url);
    } else {
      // No product_images rows — backward compat: use products.image directly
      product.gallery = product.image ? [product.image] : [];
    }

    return product;
  } catch {
    return getDummyBySlug(slug) ?? null;
  }
}

// ── getAllProductSlugs ────────────────────────────────────────────

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  if (!isSupabaseConfigured()) return DUMMY_PRODUCTS.map((p) => ({ slug: p.slug }));

  try {
    const sb = requireClient();
    const { data } = await sb.from("products").select("slug");
    if (data && data.length > 0) return data as { slug: string }[];
  } catch { /* intentional */ }

  return DUMMY_PRODUCTS.map((p) => ({ slug: p.slug }));
}

// ── getCategoryCovers ─────────────────────────────────────────────
// Returns one representative image URL per category.
// Priority: is_featured_home → has badge → newest product in category.
// Falls back to dummy data when Supabase is not configured.

type CoverRow = {
  category: string;
  image: string;
  badge: string | null;
  is_featured_home: boolean;
};

function pickCoverFromRows(rows: CoverRow[], cat: ProductCategory): string {
  const filtered = rows.filter(r => r.category === cat && r.image);
  return (
    filtered.find(r => r.is_featured_home)?.image ??
    filtered.find(r => r.badge)?.image ??
    filtered[0]?.image ??
    ""
  );
}

export async function getCategoryCovers(): Promise<Record<ProductCategory, string>> {
  const cats: ProductCategory[] = [
    "artificial-bouquet",
    "premium-collection",
    "fresh-flower",
  ];

  const fallback = (): Record<ProductCategory, string> => {
    const rows: CoverRow[] = DUMMY_PRODUCTS.map(p => ({
      category:         p.category,
      image:            p.image,
      badge:            p.badge ?? null,
      is_featured_home: p.is_featured_home ?? false,
    }));
    return Object.fromEntries(
      cats.map(c => [c, pickCoverFromRows(rows, c)]),
    ) as Record<ProductCategory, string>;
  };

  if (!isSupabaseConfigured()) return fallback();

  try {
    const sb = requireClient();
    const { data, error } = await sb
      .from("products")
      .select("category, image, badge, is_featured_home")
      .in("category", cats)
      .neq("status", "hidden")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return fallback();

    const rows = data as CoverRow[];
    return Object.fromEntries(
      cats.map(c => [c, pickCoverFromRows(rows, c)]),
    ) as Record<ProductCategory, string>;
  } catch {
    return fallback();
  }
}
