import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--btn-border-radius)] border border-transparent font-[var(--btn-font-weight)] ring-offset-background transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-brand-primary)] text-[var(--color-brand-primary-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-600)] hover:shadow-[var(--shadow-md)]",
        destructive: "bg-[var(--color-error)] text-[var(--color-error-fg)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-error-border)] hover:shadow-[var(--shadow-md)]",
        outline: "border-[var(--color-border-primary)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border-focus)]",
        secondary: "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-raised)]",
        ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]",
        link: "text-[var(--color-brand-primary)] underline-offset-4 hover:underline",
        subtle: "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]",
      },
      size: {
        default: "h-10 px-[var(--btn-padding-x)] py-[var(--btn-padding-y)] text-[var(--text-body-md)]",
        sm: "h-8 px-[var(--space-3)] text-[var(--text-body-sm)]",
        lg: "h-12 px-[var(--space-6)] text-[var(--text-body-lg)]",
        icon: "h-10 w-10 p-0",
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
