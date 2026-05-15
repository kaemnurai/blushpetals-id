-- ================================================================
-- Blush Petals.id — MASTER MIGRATION (safe, idempotent)
-- Jalankan file ini di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang kali — menggunakan IF NOT EXISTS
-- ================================================================

-- ── 1. Orders: extra_cost & extra_cost_note ─────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_cost      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_cost_note TEXT;

-- ── 2. Orders: kolom v2 ─────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date      DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'ambil';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS greeting_card   TEXT NOT NULL DEFAULT '';

-- ── 3. Products: capital_price ──────────────────────────────────
-- Harga modal produk — untuk kalkulasi profit di admin.
-- TIDAK pernah tampil ke customer.
ALTER TABLE products ADD COLUMN IF NOT EXISTS capital_price NUMERIC NOT NULL DEFAULT 0;

-- ── 4. Supabase Realtime — aktifkan untuk products & orders ─────
-- Diperlukan agar analytics, dashboard, dan laporan transaksi
-- otomatis refresh saat harga produk atau status pesanan berubah.
-- Aman dijalankan berulang kali.

DO $$
BEGIN
  -- Tambah orders ke replication jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  -- Tambah products ke replication jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

-- ── Done ────────────────────────────────────────────────────────
-- Setelah migration berhasil, fitur berikut aktif:
--   • Extra cost pada pesanan (popup Konfirmasi Terima)
--   • Harga Modal pada produk (form edit produk)
--   • Profit otomatis di Analitik, Dashboard, dan Transaksi
--   • Auto-refresh saat admin ubah harga/modal produk
