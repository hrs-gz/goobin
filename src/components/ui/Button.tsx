import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors duration-150 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--ring)] active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-strong)] shadow-[var(--shadow-sm)]",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-tile)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tile)]",
  danger:
    "bg-transparent text-[#c0563f] border border-[#e3b7ab] hover:bg-[#f7e7e2] dark:text-[#f0a591] dark:border-[#4a2b25] dark:hover:bg-[#2c1c18]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", fullWidth, type, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
