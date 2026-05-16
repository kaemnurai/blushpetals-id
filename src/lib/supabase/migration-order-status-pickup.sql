-- ================================================================
-- Blush Petals.id — Migration: Add 'pickup' to order_status enum
-- ================================================================
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman: IF NOT EXISTS mencegah error jika sudah ada.
-- Tidak mengubah atau menghapus data existing sama sekali.
--
-- WAJIB DIJALANKAN agar status "pickup" bisa disimpan ke database.
-- Tanpa migration ini, update status ke "pickup" akan error:
--   "invalid input value for enum order_status: 'pickup'"
-- ================================================================

-- Tambah nilai 'pickup' ke enum order_status
-- Posisi AFTER 'accepted' agar urutan enum sesuai flow bisnis:
--   pending → accepted → pickup → completed
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pickup' AFTER 'accepted';

-- Verifikasi hasil (opsional, bisa dihapus jika tidak perlu):
-- SELECT unnest(enum_range(NULL::order_status));
