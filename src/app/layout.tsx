import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/layout/ToastProvider";
// CART FEATURE START
import { CartProviderWrapper } from "@/components/cart/CartProviderWrapper";
// CART FEATURE END

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blushpetals.id"),
  title: {
    default: "Blush Petals.id — Blooming Happiness in Every Bouquet",
    template: "%s · Blush Petals.id",
  },
  description:
    "Florist premium dengan koleksi fresh flowers & artificial bouquet untuk wisuda, anniversary, ulang tahun, dan momen spesial lainnya.",
  keywords: [
    "florist",
    "bouquet",
    "blush petals",
    "wisuda",
    "anniversary",
    "fresh flower",
    "artificial bouquet",
  ],
  authors: [{ name: "Blush Petals.id" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://blushpetals.id",
    title: "Blush Petals.id — Blooming Happiness in Every Bouquet",
    description:
      "Florist premium dengan koleksi fresh flowers & artificial bouquet untuk wisuda, anniversary, ulang tahun, dan momen spesial lainnya.",
    siteName: "Blush Petals.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blush Petals.id",
    description: "Blooming Happiness in Every Bouquet",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff5f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        {/* CART FEATURE START */}
        <CartProviderWrapper>
        {/* CART FEATURE END */}
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <WhatsAppFloatingButton />
          <ToastProvider />
        {/* CART FEATURE START */}
        </CartProviderWrapper>
        {/* CART FEATURE END */}
      </body>
    </html>
  );
}
