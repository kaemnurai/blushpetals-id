"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default function AdminProdukPage() {
  return (
    <AdminGuard>
      {({ email, signOut }) => (
        <AdminShell email={email} onSignOut={signOut}>
          <div className="mb-8">
            <p className="section-label mb-1">Manajemen</p>
            <h1 className="font-serif text-3xl text-ink-900">Kelola Produk</h1>
            <p className="text-sm text-ink-500 mt-1">
              Tambah, edit, dan hapus produk Blush Petals.id.
            </p>
          </div>
          <ProductsTable />
        </AdminShell>
      )}
    </AdminGuard>
  );
}
