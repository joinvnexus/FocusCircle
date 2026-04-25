import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-button)] font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-brand-primary)] text-[var(--color-brand-primary-foreground)] hover:bg-[var(--color-primary-600)] shadow-sm hover:shadow",
        destructive: "bg-[var(--color-error)] text-[var(--color-error-fg)] hover:bg-[var(--color-error-bg)]/90",
        outline: "border border-[var(--color-border-primary)] bg-transparent hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]",
        secondary: "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-raised)]",
        ghost: "hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]",
        link: "text-[var(--color-brand-primary)] underline-offset-4 hover:underline",
        subtle: "bg-[var(--color-bg-surface)] border border-transparent hover:border-[var(--color-border-primary)]",
      },
      size: {
        default: "h-10 px-[var(--space-4)] py-2 text-[var(--text-body-md)]",
        sm: "h-8 px-[var(--space-3)] text-[var(--text-body-sm)]",
        lg: "h-12 px-[var(--space-6)] text-[var(--text-body-lg)]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
