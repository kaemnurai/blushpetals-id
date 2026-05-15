-- ================================================================
-- Blush Petals.id — Migration: Update products_category_check
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman: hanya mengubah constraint, tidak menyentuh data.
-- ================================================================

-- Drop constraint lama (nama default Postgres dari inline CHECK)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Tambah constraint baru dengan semua kategori yang valid
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN (
    'artificial-bouquet',
    'premium-collection',
    'fresh-flower',
    'custom',
    'graduation',
    'money-bouquet',
    'snack-bouquet'
  ));
