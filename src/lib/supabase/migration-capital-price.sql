-- ================================================================
-- Blush Petals.id — Migration: capital_price on products
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses ADD COLUMN IF NOT EXISTS)
-- ================================================================

-- capital_price: harga modal produk — hanya untuk admin, tidak tampil ke customer.
-- Digunakan untuk menghitung profit bersih di analitik dan dashboard.

ALTER TABLE products ADD COLUMN IF NOT EXISTS capital_price NUMERIC NOT NULL DEFAULT 0;
