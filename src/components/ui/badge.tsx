import * as React from "react";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className = "", variant = "default", ...props },
  ref
) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "border-transparent bg-gray-900 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-900",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "border-gray-300 text-gray-900",
  };
  const classes = `${base} ${variants[variant]} ${className}`.trim();
  return <span ref={ref} className={classes} {...props} />;
});

export default Badge;
