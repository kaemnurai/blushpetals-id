-- Blush Petals.id — Supabase schema
-- Run this in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null check (category in ('artificial-bouquet','premium-collection','fresh-flower')),
  price integer not null default 0,
  description text default '',
  image text default '',
  badge text,
  stock_status text not null default 'tersedia' check (stock_status in ('tersedia','preorder','sold-out')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table products enable row level security;

-- Public can read products
drop policy if exists "public read products" on products;
create policy "public read products"
  on products for select
  using (true);

-- Authenticated (admin) full write access
drop policy if exists "auth insert products" on products;
create policy "auth insert products"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "auth update products" on products;
create policy "auth update products"
  on products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth delete products" on products;
create policy "auth delete products"
  on products for delete
  to authenticated
  using (true);

-- Storage bucket for product images (public-readable)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "auth upload product images" on storage.objects;
create policy "auth upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

drop policy if exists "auth update product images" on storage.objects;
create policy "auth update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products');

drop policy if exists "auth delete product images" on storage.objects;
create policy "auth delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');
