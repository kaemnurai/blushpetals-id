import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "blush" | "cream" | "outline" | "dark";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-blush-100 text-blush-700",
    blush: "bg-blush-500 text-white",
    cream: "bg-cream-100 text-ink-700",
    outline: "border border-blush-200 text-blush-700",
    dark: "bg-ink-900 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium tracking-wide uppercase",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
