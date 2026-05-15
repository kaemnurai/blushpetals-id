-- ================================================================
-- Blush Petals.id — Migration: Extra Cost on Orders
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses ADD COLUMN IF NOT EXISTS)
-- ================================================================

-- extra_cost: biaya tambahan yang ditambahkan admin saat menerima pesanan (default 0)
-- extra_cost_note: keterangan biaya tambahan, misal "Ongkir", "Request custom", dll.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_cost      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_cost_note TEXT;
