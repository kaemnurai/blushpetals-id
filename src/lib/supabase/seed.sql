-- ================================================================
-- Blush Petals.id — Seed Data v2
-- Run AFTER schema.sql
-- ================================================================

-- ── Categories ────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Artificial Bouquet', 'artificial-bouquet', true),
  ('22222222-2222-2222-2222-222222222222', 'Premium Collection',  'premium-collection',  true),
  ('33333333-3333-3333-3333-333333333333', 'Fresh Flower',        'fresh-flower',        true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;

-- ── Products ──────────────────────────────────────────────────────
-- is_hero_product  → ONE product shown in the Hero section
-- is_featured_home → UP TO 4 products in the Featured section

INSERT INTO products
  (title, slug, description, price, category, category_id,
   status, featured, stock_status, image, badge,
   is_hero_product, is_featured_home)
VALUES

-- Artificial Bouquet
('Graduation A',
 'graduation-a',
 '1 boneka mini, 7 tangkai bunga mix premium, free kartu ucapan. Cocok untuk hadiah wisuda spesial.',
 100000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80',
 'Wisuda', false, false),

('Graduation B',
 'graduation-b',
 '1 boneka mini, 2–3 tangkai bunga mix. Hadiah simple yang menggemaskan.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200&auto=format&fit=crop&q=80',
 'Hemat', false, false),

('Thumbelina A',
 'thumbelina-a',
 '7–10 tangkai bunga mix, free kupu-kupu cantik, free kartu ucapan. Bouquet favorite untuk anniversary.',
 100000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', true, 'tersedia',
 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&auto=format&fit=crop&q=80',
 'Favorit', false, true),

('Thumbelina B',
 'thumbelina-b',
 'Bouquet thumbelina medium, perfect untuk birthday & momen kecil yang manis.',
 50000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&auto=format&fit=crop&q=80',
 NULL, false, false),

('Thumbelina C',
 'thumbelina-c',
 'Thumbelina mini, cantik untuk hadiah simple yang berkesan.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&auto=format&fit=crop&q=80',
 NULL, false, false),

('Butterfly Bouquet',
 'butterfly-bouquet',
 'Bouquet artificial dengan aksen kupu-kupu warna pastel yang romantis.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&auto=format&fit=crop&q=80',
 NULL, false, false),

('Snack Bouquet',
 'snack-bouquet',
 'Bouquet snack favorit pasangan, isi snack pilihan + dekorasi bunga.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1558170439-3d472e3a4b1f?w=1200&auto=format&fit=crop&q=80',
 'Cute', false, false),

('Money Bouquet',
 'money-bouquet',
 'Money bouquet mini, uang asli dilipat estetik dengan bunga pastel.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
 NULL, false, false),

('Mini Bloom',
 'mini-bloom',
 'Mini bloom soft pastel, hadiah kecil yang elegan.',
 35000, 'artificial-bouquet', '11111111-1111-1111-1111-111111111111',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
 NULL, false, false),

-- Premium Collection
('Signature Jumbo Bloom',
 'signature-jumbo-bloom',
 'Signature jumbo bloom, koleksi premium dengan ukuran besar dan rangkaian eksklusif.',
 225000, 'premium-collection', '22222222-2222-2222-2222-222222222222',
 'available', true, 'tersedia',
 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=1200&auto=format&fit=crop&q=80',
 'Signature', false, true),

('Signature Jumbo Money Bouquet',
 'signature-jumbo-money-bouquet',
 'Money bouquet jumbo edisi signature, perfect untuk hadiah istimewa.',
 150000, 'premium-collection', '22222222-2222-2222-2222-222222222222',
 'available', false, 'tersedia',
 'https://images.unsplash.com/photo-1606041011872-596597976b25?w=1200&auto=format&fit=crop&q=80',
 'Signature', false, false),

-- Fresh Flower
('Fresh Rose Bouquet',
 'fresh-rose-bouquet',
 'Mawar segar pilihan, dirangkai harian dengan wrapping pastel premium.',
 125000, 'fresh-flower', '33333333-3333-3333-3333-333333333333',
 'available', true, 'tersedia',
 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80',
 'Fresh Daily', true, true),  -- HERO product

('White Lily Bouquet',
 'white-lily-bouquet',
 'Lily putih elegan, simbol kesucian dan ketulusan. Wrapping cream lembut.',
 150000, 'fresh-flower', '33333333-3333-3333-3333-333333333333',
 'available', false, 'preorder',
 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&auto=format&fit=crop&q=80',
 'Limited Stock', false, false),

('Mixed Pastel Fresh Bouquet',
 'mixed-pastel-fresh-bouquet',
 'Campuran bunga segar warna pastel — mawar, baby breath, eustoma. Bestseller.',
 175000, 'fresh-flower', '33333333-3333-3333-3333-333333333333',
 'available', true, 'tersedia',
 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&auto=format&fit=crop&q=80',
 'Best Seller', false, true)

ON CONFLICT (slug) DO UPDATE SET
  title            = EXCLUDED.title,
  description      = EXCLUDED.description,
  price            = EXCLUDED.price,
  category         = EXCLUDED.category,
  category_id      = EXCLUDED.category_id,
  status           = EXCLUDED.status,
  featured         = EXCLUDED.featured,
  stock_status     = EXCLUDED.stock_status,
  image            = EXCLUDED.image,
  badge            = EXCLUDED.badge,
  is_hero_product  = EXCLUDED.is_hero_product,
  is_featured_home = EXCLUDED.is_featured_home;
