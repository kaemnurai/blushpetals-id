import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container py-24 text-center">
      <p className="text-7xl mb-4">❀</p>
      <h1 className="font-serif text-4xl text-ink-900">Halaman tidak ditemukan</h1>
      <p className="text-ink-500 mt-3">
        Sepertinya bouquet yang kamu cari sudah dipetik orang lain.
      </p>
      <Link
        href="/"
        className="inline-flex items-center mt-7 h-12 px-7 rounded-full bg-blush-500 text-white text-sm hover:brightness-105"
      >
        Kembali ke Beranda
      </Link>
    </section>
  );
}
