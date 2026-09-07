import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rect" | "circle" | "text" | "rounded";
  width?: number | string;
  height?: number | string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", width, height, ...props }, ref) => {
    const variantClasses = {
      rect: "rounded-[var(--radius-sm)]",
      circle: "rounded-full",
      text: "rounded-[var(--radius-sm)]",
      rounded: "rounded-[var(--radius-md)]",
    };

    const style = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-[var(--color-bg-surface)]",
          variantClasses[variant],
          className
        )}
        style={style}
        {...props}
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--color-border-secondary)]/30 to-transparent" />
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
