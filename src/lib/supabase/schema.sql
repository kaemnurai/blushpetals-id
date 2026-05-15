-- ================================================================
-- Blush Petals.id — Database Schema v3
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS + DO $$ guards).
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- ENUMS
-- ================================================================

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('available', 'sold_out', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- 1. CATEGORIES
-- ================================================================

CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        UNIQUE NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 2. PRODUCTS
-- ================================================================

CREATE TABLE IF NOT EXISTS products (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  -- `title` is the canonical product name column.
  -- The column was called `name` in schema v1/v2; safe rename guard below.
  title            TEXT           NOT NULL,
  slug             TEXT           UNIQUE NOT NULL,
  description      TEXT           DEFAULT '',
  price            INTEGER        NOT NULL DEFAULT 0,
  -- `category` (text slug) kept alongside FK for backward-compat with
  -- existing frontend filter queries.
  category         TEXT           NOT NULL DEFAULT 'artificial-bouquet'
                                  CHECK (category IN (
                                    'artificial-bouquet',
                                    'premium-collection',
                                    'fresh-flower',
                                    'custom',
                                    'graduation',
                                    'money-bouquet',
                                    'snack-bouquet'
                                  )),
  category_id      UUID           REFERENCES categories(id) ON DELETE SET NULL,
  status           product_status NOT NULL DEFAULT 'available',
  -- General favourites flag (legacy – kept for compat)
  featured         BOOLEAN        NOT NULL DEFAULT false,
  stock_status     TEXT           NOT NULL DEFAULT 'tersedia'
                                  CHECK (stock_status IN ('tersedia','preorder','sold-out')),
  image            TEXT           DEFAULT '',
  badge            TEXT,
  wrapping_options JSONB          NOT NULL DEFAULT '[]',
  -- Homepage placement flags
  is_featured_home BOOLEAN        NOT NULL DEFAULT false,  -- max 4, enforced in app
  is_hero_product  BOOLEAN        NOT NULL DEFAULT false,  -- max 1, enforced in app + partial index
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ── Safe rename: `name` → `title` (run only if old column exists) ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'name'
  ) THEN
    ALTER TABLE products RENAME COLUMN name TO title;
  END IF;
END $$;

-- ── Partial unique index: at most one hero product ─────────────────
-- The app also enforces this (unsets previous before setting new),
-- but the index is the safety net.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_hero_product
  ON products (is_hero_product) WHERE is_hero_product = true;

-- ── auto updated_at ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE _update_updated_at();

-- ================================================================
-- 3. PRODUCT IMAGES  (gallery + thumbnail)
-- ================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url    TEXT        NOT NULL,
  is_thumbnail BOOLEAN     NOT NULL DEFAULT false,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 4. ORDERS
-- ================================================================

CREATE TABLE IF NOT EXISTS orders (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   TEXT         NOT NULL,
  whatsapp        TEXT         NOT NULL,
  order_date      DATE,
  pickup_date     DATE,
  order_notes     TEXT         NOT NULL DEFAULT '',
  wrapping        TEXT         NOT NULL DEFAULT '',
  delivery_method TEXT         NOT NULL DEFAULT 'ambil',
  greeting_card   TEXT         NOT NULL DEFAULT '',
  status          order_status NOT NULL DEFAULT 'pending',
  total_price     INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Safe migration for existing installs (no-op on fresh install)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date      DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'ambil';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS greeting_card   TEXT NOT NULL DEFAULT '';

-- ================================================================
-- 5. ORDER ITEMS
-- ================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID    REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  price      INTEGER NOT NULL DEFAULT 0
);

-- ================================================================
-- 6. HOMEPAGE SETTINGS  (single-row config)
-- ================================================================

CREATE TABLE IF NOT EXISTS homepage_settings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title    TEXT        DEFAULT 'Blush Petals.id',
  hero_subtitle TEXT        DEFAULT 'Blooming Happiness in Every Bouquet',
  cta_text      TEXT        DEFAULT 'Pesan Sekarang',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO homepage_settings (hero_title, hero_subtitle, cta_text)
VALUES ('Blush Petals.id', 'Blooming Happiness in Every Bouquet', 'Pesan Sekarang')
ON CONFLICT DO NOTHING;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub_read_categories"  ON categories;
DROP POLICY IF EXISTS "auth_all_categories"  ON categories;
CREATE POLICY "pub_read_categories"  ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "auth_all_categories"  ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products (status='hidden' rows are invisible to public)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub_read_products"  ON products;
DROP POLICY IF EXISTS "auth_all_products"  ON products;
CREATE POLICY "pub_read_products"  ON products FOR SELECT USING (status <> 'hidden');
CREATE POLICY "auth_all_products"  ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Product Images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub_read_product_images"  ON product_images;
DROP POLICY IF EXISTS "auth_all_product_images"  ON product_images;
CREATE POLICY "pub_read_product_images"  ON product_images FOR SELECT USING (true);
CREATE POLICY "auth_all_product_images"  ON product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders
-- Authenticated admins: full access
-- Public (customers): INSERT only (so they can submit orders without logging in)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_orders"    ON orders;
DROP POLICY IF EXISTS "pub_insert_orders"  ON orders;
CREATE POLICY "auth_all_orders"    ON orders FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pub_insert_orders"  ON orders FOR INSERT WITH CHECK (true);

-- Order Items
-- Same pattern as orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_order_items"    ON order_items;
DROP POLICY IF EXISTS "pub_insert_order_items"  ON order_items;
CREATE POLICY "auth_all_order_items"    ON order_items FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pub_insert_order_items"  ON order_items FOR INSERT WITH CHECK (true);

-- Homepage Settings
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub_read_homepage_settings"  ON homepage_settings;
DROP POLICY IF EXISTS "auth_all_homepage_settings"  ON homepage_settings;
CREATE POLICY "pub_read_homepage_settings"  ON homepage_settings FOR SELECT USING (true);
CREATE POLICY "auth_all_homepage_settings"  ON homepage_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- STORAGE BUCKET: products
-- ================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_pub_read"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_ins"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_upd"   ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_del"   ON storage.objects;

CREATE POLICY "storage_pub_read"  ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "storage_auth_ins"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "storage_auth_upd"  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "storage_auth_del"  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
