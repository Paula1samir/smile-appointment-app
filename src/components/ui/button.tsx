import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl transform",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white focus:ring-primary/20 dark:from-primary-700 dark:to-primary-900 dark:hover:from-primary-800 dark:hover:to-primary-900",
        destructive:
          "bg-gradient-to-r from-error to-error-600 hover:from-error-600 hover:to-error-700 text-white focus:ring-error/20 dark:from-error-700 dark:to-error-900 dark:hover:from-error-800 dark:hover:to-error-900",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white focus:ring-primary/20 shadow-lg hover:shadow-xl dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-white",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 focus:ring-primary/20 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800",
        ghost: "hover:bg-primary/10 text-gray-700 hover:text-primary shadow-none hover:shadow-lg dark:text-gray-100 dark:hover:bg-primary/10 dark:hover:text-primary-300",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none dark:text-primary-300 dark:hover:text-primary-400",
        accent: "bg-gradient-to-r from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white focus:ring-accent/20 dark:from-accent-700 dark:to-accent-900 dark:hover:from-accent-800 dark:hover:to-accent-900",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-6 py-2 sm:py-3 text-sm",
        sm: "h-8 sm:h-9 rounded-lg px-3 sm:px-4 text-xs sm:text-sm",
        lg: "h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-sm sm:text-base",
        icon: "h-10 sm:h-11 w-10 sm:w-11 rounded-xl",
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
