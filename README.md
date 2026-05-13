# Blush Petals.id 🌸

> **Blooming Happiness in Every Bouquet**

Premium florist website — mobile-first, feminine, elegant. Built with **Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion + Supabase**.

---

## ✨ Features

- 🎀 **Modern florist UI** — soft pastel, blush, cream, elegant typography
- 📱 **Mobile-first** with bottom navigation (like a native app)
- 🌹 **Catalog** with 3 categories: Artificial Bouquet, Premium Collection, Fresh Flower
- 🖼️ **Product detail** — swipeable gallery, wrapping color picker, sticky bottom CTA
- 💬 **WhatsApp checkout** — order form → auto-open WhatsApp with formatted message
- 🔐 **Admin panel** — Supabase Auth login, full CRUD products with image upload
- 🚀 **SEO + PWA-ready** — metadata, sitemap, robots, manifest
- ⚡ **Smooth animations** — Framer Motion, floating bouquet, hover effects

---

## 🛠️ Tech Stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| Framework| Next.js 14 (App Router)                 |
| Language | TypeScript                              |
| Styling  | Tailwind CSS + custom design tokens     |
| Motion   | Framer Motion                           |
| Database | Supabase Postgres + Storage + Auth      |
| Icons    | Lucide React                            |
| Toasts   | react-hot-toast                         |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy `.env.example` → `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
NEXT_PUBLIC_WHATSAPP_NUMBER=6281322118378
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `src/lib/supabase/schema.sql` (creates `products` table + RLS + storage bucket).
3. **Auth → Users** → invite an admin via email (e.g. `admin@blushpetals.id`) — they can log in at `/admin/login`.

### 4. Seed dummy products (optional)

```bash
SUPABASE_SERVICE_ROLE=your-service-role-key node scripts/seed.mjs
```

(or just use the in-code dummy data — works without Supabase for the customer-facing pages)

### 5. Run dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (homepage, katalog, produk/[slug], tentang, cara-pemesanan)
│   ├── admin/ (login, dashboard, produk)
│   ├── layout.tsx, globals.css, sitemap.ts, robots.ts
├── components/
│   ├── layout/ (Navbar, BottomNav, Footer, WhatsAppFloatingButton)
│   ├── ui/ (Button, Input, Modal, Card, Badge, Skeleton)
│   ├── home/ (Hero, Categories, Featured, Advantages, Testimonials, CTA)
│   ├── product/ (ProductCard, ProductGrid, ProductGallery, ProductDetail, OrderModal)
│   ├── catalog/ (CatalogClient)
│   └── admin/ (AdminGuard, AdminShell, ProductsTable, ProductForm)
├── lib/
│   ├── data/ (products, site config)
│   ├── supabase/ (client, schema.sql)
│   ├── types.ts, utils.ts, whatsapp.ts
```

---

## 🔑 Admin Access

- `/admin/login` — Supabase Auth login
- `/admin` — dashboard with stats
- `/admin/produk` — CRUD products (add, edit, delete, upload images, change status)

Statuses: `tersedia` · `preorder` · `sold-out`.

---

## 💬 WhatsApp Checkout

Clicking **Pesan Sekarang** on a product opens an order form. On submit, it builds a formatted message and opens `https://wa.me/<NUMBER>?text=...`. Phone number is configurable via `NEXT_PUBLIC_WHATSAPP_NUMBER`.

Default number: **+62 813-2211-8378**

---

## 🎨 Design Tokens

| Token     | Color     | Use                  |
| --------- | --------- | -------------------- |
| `blush-500` | `#f76b94` | Primary CTA          |
| `blush-100` | `#ffe5ec` | Soft surfaces        |
| `cream-100` | `#fff3e8` | Warm background      |
| `ink-900`   | `#2a1f24` | Text & accents       |

Typography: **Playfair Display** (serif headings) + **Inter** (body).

---

## 📜 License

© Blush Petals.id — All rights reserved.
