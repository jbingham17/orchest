import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";

    const variants = {
      default:
        "bg-[var(--primary)] text-[var(--primary-foreground)]",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      outline:
        "border border-[var(--border)] text-[var(--foreground)]",
      success:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      destructive:
        "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
