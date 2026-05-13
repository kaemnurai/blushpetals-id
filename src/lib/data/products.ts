import type { Product } from "@/lib/types";

// Aesthetic florist placeholder images (Unsplash).
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
  snack:
    "https://images.unsplash.com/photo-1558170439-3d472e3a4b1f?w=1200&auto=format&fit=crop&q=80",
  money:
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80",
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

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Graduation A",
    slug: "graduation-a",
    category: "artificial-bouquet",
    price: 100000,
    description:
      "1 boneka mini, 7 tangkai bunga mix premium, free kartu ucapan. Cocok untuk hadiah wisuda spesial.",
    image: IMG.graduationA,
    gallery: [IMG.graduationA, IMG.thumbelinaA, IMG.miniBloom],
    badge: "Wisuda",
    stock_status: "tersedia",
  },
  {
    id: "2",
    name: "Graduation B",
    slug: "graduation-b",
    category: "artificial-bouquet",
    price: 35000,
    description: "1 boneka mini, 2–3 tangkai bunga mix. Hadiah simple yang menggemaskan.",
    image: IMG.graduationB,
    badge: "Hemat",
    stock_status: "tersedia",
  },
  {
    id: "3",
    name: "Thumbelina A",
    slug: "thumbelina-a",
    category: "artificial-bouquet",
    price: 100000,
    description:
      "7–10 tangkai bunga mix, free kupu-kupu cantik, free kartu ucapan. Bouquet favorite untuk anniversary.",
    image: IMG.thumbelinaA,
    gallery: [IMG.thumbelinaA, IMG.butterfly, IMG.miniBloom],
    badge: "Favorit",
    stock_status: "tersedia",
  },
  {
    id: "4",
    name: "Thumbelina B",
    slug: "thumbelina-b",
    category: "artificial-bouquet",
    price: 50000,
    description: "Bouquet thumbelina medium, perfect untuk birthday & momen kecil yang manis.",
    image: IMG.thumbelinaB,
    stock_status: "tersedia",
  },
  {
    id: "5",
    name: "Thumbelina C",
    slug: "thumbelina-c",
    category: "artificial-bouquet",
    price: 35000,
    description: "Thumbelina mini, cantik untuk hadiah simple yang berkesan.",
    image: IMG.thumbelinaC,
    stock_status: "tersedia",
  },
  {
    id: "6",
    name: "Butterfly Bouquet",
    slug: "butterfly-bouquet",
    category: "artificial-bouquet",
    price: 35000,
    description: "Bouquet artificial dengan aksen kupu-kupu warna pastel yang romantis.",
    image: IMG.butterfly,
    stock_status: "tersedia",
  },
  {
    id: "7",
    name: "Snack Bouquet",
    slug: "snack-bouquet",
    category: "artificial-bouquet",
    price: 35000,
    description: "Bouquet snack favorit pasangan, isi snack pilihan + dekorasi bunga.",
    image: IMG.snack,
    badge: "Cute",
    stock_status: "tersedia",
  },
  {
    id: "8",
    name: "Money Bouquet",
    slug: "money-bouquet",
    category: "artificial-bouquet",
    price: 35000,
    description: "Money bouquet mini, uang asli dilipat estetik dengan bunga pastel.",
    image: IMG.money,
    stock_status: "tersedia",
  },
  {
    id: "9",
    name: "Mini Bloom",
    slug: "mini-bloom",
    category: "artificial-bouquet",
    price: 35000,
    description: "Mini bloom soft pastel, hadiah kecil yang elegan.",
    image: IMG.miniBloom,
    stock_status: "tersedia",
  },
  // Premium
  {
    id: "10",
    name: "Signature Jumbo Bloom",
    slug: "signature-jumbo-bloom",
    category: "premium-collection",
    price: 225000,
    description:
      "Signature jumbo bloom, koleksi premium dengan ukuran besar dan rangkaian eksklusif.",
    image: IMG.jumboBloom,
    gallery: [IMG.jumboBloom, IMG.jumboMoney, IMG.pastelFresh],
    badge: "Signature",
    stock_status: "tersedia",
  },
  {
    id: "11",
    name: "Signature Jumbo Money Bouquet",
    slug: "signature-jumbo-money-bouquet",
    category: "premium-collection",
    price: 150000,
    description:
      "Money bouquet jumbo edisi signature, perfect untuk hadiah istimewa.",
    image: IMG.jumboMoney,
    badge: "Signature",
    stock_status: "tersedia",
  },
  // Fresh
  {
    id: "12",
    name: "Fresh Rose Bouquet",
    slug: "fresh-rose-bouquet",
    category: "fresh-flower",
    price: 125000,
    description:
      "Mawar segar pilihan, dirangkai harian dengan wrapping pastel premium.",
    image: IMG.freshRose,
    gallery: [IMG.freshRose, IMG.pastelFresh, IMG.whiteLily],
    badge: "Fresh Daily",
    stock_status: "tersedia",
  },
  {
    id: "13",
    name: "White Lily Bouquet",
    slug: "white-lily-bouquet",
    category: "fresh-flower",
    price: 150000,
    description:
      "Lily putih elegan, simbol kesucian dan ketulusan. Wrapping cream lembut.",
    image: IMG.whiteLily,
    badge: "Limited Stock",
    stock_status: "preorder",
  },
  {
    id: "14",
    name: "Mixed Pastel Fresh Bouquet",
    slug: "mixed-pastel-fresh-bouquet",
    category: "fresh-flower",
    price: 175000,
    description:
      "Campuran bunga segar warna pastel — mawar, baby breath, eustoma. Bestseller.",
    image: IMG.pastelFresh,
    gallery: [IMG.pastelFresh, IMG.freshRose, IMG.whiteLily],
    badge: "Best Seller",
    stock_status: "tersedia",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return DUMMY_PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return DUMMY_PRODUCTS.filter((p) =>
    ["fresh-rose-bouquet", "signature-jumbo-bloom", "thumbelina-a", "mixed-pastel-fresh-bouquet"].includes(
      p.slug,
    ),
  );
}
