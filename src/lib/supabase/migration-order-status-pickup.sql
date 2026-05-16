-- ================================================================
-- Blush Petals.id — Migration: Add 'pickup' to order_status enum
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman: hanya menambah nilai baru ke enum, tidak mengubah data existing.
-- ================================================================

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pickup' AFTER 'accepted';
