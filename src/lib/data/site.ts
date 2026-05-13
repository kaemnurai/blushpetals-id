export const SITE = {
  name: "Blush Petals.id",
  tagline: "Blooming Happiness in Every Bouquet",
  description:
    "Fresh Flowers & Artificial Flowers untuk wisuda, anniversary, ulang tahun, dan momen spesial lainnya.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281322118378",
  instagram: "@blushpetals.id",
};

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Katalog", href: "/katalog" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Cara Pemesanan", href: "/cara-pemesanan" },
];

export const TESTIMONIALS = [
  {
    name: "Aisyah P.",
    role: "Wisudawati Universitas Padjadjaran",
    quote:
      "Bouquet wisudanya cantik banget! Detail dan wrappingnya rapi, foto-fotonya jadi makin estetik.",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Raka D.",
    role: "Customer Anniversary",
    quote:
      "Pesan untuk anniversary, sampai dengan selamat & rapih. Pacar saya seneng banget pas terima.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Mira S.",
    role: "Birthday Surprise",
    quote:
      "Pelayanan ramah, fast respond, dan hasil bouquetnya melebihi ekspektasi. Recommended seller!",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  },
];

export const ADVANTAGES = [
  {
    title: "Fresh & Premium",
    desc: "Bunga segar pilihan langsung dari supplier terbaik, dirangkai harian.",
    icon: "flower",
  },
  {
    title: "Custom Request",
    desc: "Bisa request warna wrapping, kartu ucapan, hingga jenis bunga sesuai keinginan.",
    icon: "sparkles",
  },
  {
    title: "Fast Response",
    desc: "Order cepat via WhatsApp, balasan ramah & informatif setiap saat.",
    icon: "message",
  },
  {
    title: "Same Day Service",
    desc: "Order pagi, sore bisa diambil atau dikirim via GoSend area kota.",
    icon: "truck",
  },
];
