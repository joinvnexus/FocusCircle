import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn(
      orientation === 'horizontal' ? '-mx-1 my-1 h-[1px] w-[calc(100%+0.5rem)] bg-border' : '-my-1 mx-1 h-[calc(100%+0.5rem)] w-[1px] bg-border',
      className
    )}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator }
