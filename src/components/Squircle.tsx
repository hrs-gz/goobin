import { cn } from "@/lib/utils";

interface SquircleProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Squircle({
  children,
  className,
  as: Component = "div",
  onClick,
  style,
}: SquircleProps) {
  return (
    <Component
      className={cn("squircle overflow-hidden", className)}
      onClick={onClick}
      style={style}
      type={Component === "button" ? "button" : undefined}
    >
      {children}
    </Component>
  );
}
