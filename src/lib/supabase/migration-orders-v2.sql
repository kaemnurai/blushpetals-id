-- ================================================================
-- Blush Petals.id — Orders table migration v2
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Paste seluruh isi file ini
-- 3. Klik "Run"
--
-- Aman untuk di-run ulang (IF NOT EXISTS + default value).
-- ================================================================

-- Tambah kolom yang mungkin belum ada di instansi lama
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date       DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method  TEXT NOT NULL DEFAULT 'ambil';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS greeting_card    TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name    TEXT NOT NULL DEFAULT '';

-- Pastikan order_notes ada (beberapa instansi mungkin pakai 'notes')
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes      TEXT NOT NULL DEFAULT '';

-- ── Verifikasi: cek semua kolom wajib sudah ada ────────────────────
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
