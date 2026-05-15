// CART FEATURE START
"use client";

import * as React from "react";
import { CartProvider } from "@/lib/cart-context";
import { CartPanel } from "./CartPanel";

/**
 * Client-side wrapper that provides the cart context to the entire app
 * and renders the CartPanel at root level so it's always accessible.
 * Imported by the root layout (Server Component).
 */
export function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartPanel />
    </CartProvider>
  );
}
// CART FEATURE END
