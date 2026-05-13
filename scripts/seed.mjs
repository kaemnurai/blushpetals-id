#!/usr/bin/env node
// Seed dummy products into Supabase.
// Run: node scripts/seed.mjs
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE (or NEXT_PUBLIC_SUPABASE_ANON_KEY)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or service key in env.");
  process.exit(1);
}

const supabase = createClient(url, key);

const IMG = {
  graduationA:
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80",
  graduationB:
    "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200&auto=format&fit=crop&q=80",
  thumbelinaA:
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&auto=format&fit=crop&q=80",
  thumbelinaB:
    "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&auto=format&fit=crop&q=80",
  thumbelinaC:
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&auto=format&fit=crop&q=80",
  butterfly:
    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&auto=format&fit=crop&q=80",
  snack: "https://images.unsplash.com/photo-1558170439-3d472e3a4b1f?w=1200&auto=format&fit=crop&q=80",
  money: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
  miniBloom:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80",
  jumboBloom:
    "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=1200&auto=format&fit=crop&q=80",
  jumboMoney:
    "https://images.unsplash.com/photo-1606041011872-596597976b25?w=1200&auto=format&fit=crop&q=80",
  freshRose:
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80",
  whiteLily:
    "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&auto=format&fit=crop&q=80",
  pastelFresh:
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&auto=format&fit=crop&q=80",
};

const products = [
  { name: "Graduation A", slug: "graduation-a", category: "artificial-bouquet", price: 100000, description: "1 boneka mini, 7 tangkai bunga mix premium, free kartu ucapan.", image: IMG.graduationA, badge: "Wisuda", stock_status: "tersedia" },
  { name: "Graduation B", slug: "graduation-b", category: "artificial-bouquet", price: 35000, description: "1 boneka mini, 2–3 tangkai bunga mix.", image: IMG.graduationB, badge: "Hemat", stock_status: "tersedia" },
  { name: "Thumbelina A", slug: "thumbelina-a", category: "artificial-bouquet", price: 100000, description: "7–10 tangkai bunga mix, free kupu-kupu, free kartu ucapan.", image: IMG.thumbelinaA, badge: "Favorit", stock_status: "tersedia" },
  { name: "Thumbelina B", slug: "thumbelina-b", category: "artificial-bouquet", price: 50000, description: "Bouquet thumbelina medium.", image: IMG.thumbelinaB, badge: null, stock_status: "tersedia" },
  { name: "Thumbelina C", slug: "thumbelina-c", category: "artificial-bouquet", price: 35000, description: "Thumbelina mini.", image: IMG.thumbelinaC, badge: null, stock_status: "tersedia" },
  { name: "Butterfly Bouquet", slug: "butterfly-bouquet", category: "artificial-bouquet", price: 35000, description: "Bouquet artificial dengan aksen kupu-kupu pastel.", image: IMG.butterfly, badge: null, stock_status: "tersedia" },
  { name: "Snack Bouquet", slug: "snack-bouquet", category: "artificial-bouquet", price: 35000, description: "Bouquet snack favorit pasangan.", image: IMG.snack, badge: "Cute", stock_status: "tersedia" },
  { name: "Money Bouquet", slug: "money-bouquet", category: "artificial-bouquet", price: 35000, description: "Money bouquet mini.", image: IMG.money, badge: null, stock_status: "tersedia" },
  { name: "Mini Bloom", slug: "mini-bloom", category: "artificial-bouquet", price: 35000, description: "Mini bloom soft pastel.", image: IMG.miniBloom, badge: null, stock_status: "tersedia" },
  { name: "Signature Jumbo Bloom", slug: "signature-jumbo-bloom", category: "premium-collection", price: 225000, description: "Signature jumbo bloom, koleksi premium ukuran besar.", image: IMG.jumboBloom, badge: "Signature", stock_status: "tersedia" },
  { name: "Signature Jumbo Money Bouquet", slug: "signature-jumbo-money-bouquet", category: "premium-collection", price: 150000, description: "Money bouquet jumbo edisi signature.", image: IMG.jumboMoney, badge: "Signature", stock_status: "tersedia" },
  { name: "Fresh Rose Bouquet", slug: "fresh-rose-bouquet", category: "fresh-flower", price: 125000, description: "Mawar segar pilihan, dirangkai harian.", image: IMG.freshRose, badge: "Fresh Daily", stock_status: "tersedia" },
  { name: "White Lily Bouquet", slug: "white-lily-bouquet", category: "fresh-flower", price: 150000, description: "Lily putih elegan dan timeless.", image: IMG.whiteLily, badge: "Limited Stock", stock_status: "preorder" },
  { name: "Mixed Pastel Fresh Bouquet", slug: "mixed-pastel-fresh-bouquet", category: "fresh-flower", price: 175000, description: "Campuran bunga segar warna pastel.", image: IMG.pastelFresh, badge: "Best Seller", stock_status: "tersedia" },
];

const { error } = await supabase.from("products").upsert(products, { onConflict: "slug" });
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`✔ Seeded ${products.length} products.`);
