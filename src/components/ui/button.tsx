import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98] shadow-soft hover:shadow-soft-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-600 focus:ring-primary/20",
        destructive:
          "bg-error text-error-foreground hover:bg-error-600 focus:ring-error/20",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-primary hover:border-primary/30 focus:ring-primary/20",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-primary/20",
        ghost: "hover:bg-gray-100 text-gray-700 hover:text-primary shadow-none hover:shadow-soft",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none",
        accent: "bg-accent text-accent-foreground hover:bg-accent-600 focus:ring-accent/20",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
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
