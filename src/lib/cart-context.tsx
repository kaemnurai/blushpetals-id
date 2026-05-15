// CART FEATURE START
"use client";

import * as React from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "blushpetals_cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartId">) => void;
  removeItem: (cartId: string) => void;
  updateQty: (cartId: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function makeCartId(item: Omit<CartItem, "cartId">): string {
  return `${item.productId}__${item.wrapping}__${item.ribbon}`;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore quota errors */ }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => loadFromStorage());
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addItem = React.useCallback((item: Omit<CartItem, "cartId">) => {
    const cartId = makeCartId(item);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, { ...item, cartId }];
    });
    setPanelOpen(true);
  }, []);

  const removeItem = React.useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQty = React.useCallback((cartId: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalCount,
        totalPrice,
        panelOpen,
        setPanelOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
// CART FEATURE END
