import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "border text-[var(--color-text-primary)] transition-[border-color,box-shadow,background-color] duration-200",
  {
    variants: {
      variant: {
        default: "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]",
        elevated: "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        outline: "border-[var(--color-border-primary)] bg-transparent",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      radius: {
        sm: "rounded-[var(--radius-sm)]",
        md: "rounded-[var(--radius-md)]",
        lg: "rounded-[var(--radius-lg)]",
        xl: "rounded-[var(--radius-xl)]",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "lg",
    },
  },
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, radius, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, radius }), className)}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[var(--text-heading-lg)] font-semibold leading-[var(--leading-tight)] tracking-tight text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-text-muted)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
