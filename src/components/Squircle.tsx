import { cn } from "@/lib/utils";

type SquircleSize = "sm" | "md" | "lg";

const sizeClass: Record<SquircleSize, string> = {
  sm: "squircle-sm",
  md: "squircle",
  lg: "squircle-lg",
};

interface SquircleProps {
  children: React.ReactNode;
  className?: string;
  size?: SquircleSize;
  as?: "div" | "button";
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Squircle({
  children,
  className,
  size = "md",
  as: Component = "div",
  onClick,
  style,
}: SquircleProps) {
  return (
    <Component
      className={cn(sizeClass[size], "overflow-hidden", className)}
      onClick={onClick}
      style={style}
      type={Component === "button" ? "button" : undefined}
    >
      {children}
    </Component>
  );
}
