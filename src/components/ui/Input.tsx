import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-blush-100 bg-white/80 px-4 py-2 text-sm",
        "placeholder:text-ink-400 focus:border-blush-300 focus:outline-none focus:ring-4 focus:ring-blush-100",
        "transition disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-2xl border border-blush-100 bg-white/80 px-4 py-3 text-sm",
        "placeholder:text-ink-400 focus:border-blush-300 focus:outline-none focus:ring-4 focus:ring-blush-100",
        "transition resize-none",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-blush-100 bg-white/80 px-4 py-2 text-sm",
        "focus:border-blush-300 focus:outline-none focus:ring-4 focus:ring-blush-100 transition",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-700 ml-1">
        {label}
        {required && <span className="text-blush-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-ink-400 ml-1">{hint}</p>}
    </div>
  );
}
