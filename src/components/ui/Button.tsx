"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-300 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-soft hover:shadow-glow hover:brightness-105",
        secondary:
          "bg-white text-ink-900 border border-blush-100 hover:bg-blush-50 shadow-card",
        ghost: "bg-transparent hover:bg-blush-50 text-ink-800",
        outline:
          "bg-transparent text-ink-900 border border-ink-900/15 hover:border-blush-300 hover:text-blush-600",
        whatsapp:
          "bg-[#25D366] text-white hover:brightness-110 shadow-soft",
        soft:
          "bg-blush-100 text-blush-700 hover:bg-blush-200",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
