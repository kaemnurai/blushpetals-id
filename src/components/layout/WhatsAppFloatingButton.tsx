"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { quickEnquiryUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <motion.a
      href={quickEnquiryUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.93 }}
      className="fixed bottom-24 md:bottom-7 right-4 md:right-7 z-40
                 h-14 w-14 rounded-full
                 bg-[#25D366] text-white
                 flex items-center justify-center
                 shadow-[0_4px_20px_rgba(37,211,102,0.45),0_0_0_1px_rgba(255,255,255,0.15)]
                 animate-pulse-wa
                 ring-2 ring-white/30"
    >
      {/* Subtle glass ring */}
      <span className="absolute inset-0 rounded-full bg-white/10 border border-white/20" />
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current relative z-10" aria-hidden>
        <path d="M20.52 3.48A11.94 11.94 0 0 0 12.02 0C5.39 0 .02 5.37.02 12c0 2.11.55 4.16 1.61 5.97L0 24l6.2-1.62A11.96 11.96 0 0 0 12.02 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.5-8.52ZM12.02 22a9.94 9.94 0 0 1-5.07-1.39l-.36-.21-3.68.96.99-3.59-.24-.37A9.96 9.96 0 1 1 22.02 12c0 5.51-4.49 10-10 10Zm5.46-7.49c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.09 3.2 5.07 4.49.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.21-.57-.36Z" />
      </svg>
    </motion.a>
  );
}
