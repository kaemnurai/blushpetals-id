"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#fff",
          color: "#2a1f24",
          border: "1px solid #ffe5ec",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "0 10px 30px -12px rgba(243, 130, 165, 0.25)",
        },
      }}
    />
  );
}
