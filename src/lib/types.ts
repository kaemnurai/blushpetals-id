export type ProductCategory =
  | "artificial-bouquet"
  | "premium-collection"
  | "fresh-flower";

export type StockStatus = "tersedia" | "preorder" | "sold-out";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  gallery?: string[];
  badge?: string | null;
  stock_status: StockStatus;
  created_at?: string;
}

export interface OrderForm {
  customerName: string;
  whatsapp: string;
  orderDate: string;
  pickupDate: string;
  productName: string;
  wrappingColor?: string;
  cardMessage?: string;
  note?: string;
  method: "ambil" | "gosend";
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  "artificial-bouquet": "Artificial Bouquet",
  "premium-collection": "Premium Collection",
  "fresh-flower": "Fresh Flower Collection",
};

export const STATUS_LABEL: Record<StockStatus, string> = {
  tersedia: "Tersedia",
  preorder: "Pre-order",
  "sold-out": "Sold Out",
};
