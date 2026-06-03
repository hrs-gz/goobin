export function GoobinLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      className={`font-display font-semibold tracking-tight lowercase ${sizes[size]}`}
      aria-label="goobin"
    >
      goobin
    </span>
  );
}
