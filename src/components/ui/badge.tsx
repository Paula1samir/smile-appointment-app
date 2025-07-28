import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:scale-105 transform",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 dark:from-primary-700 dark:to-primary-900",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100",
        destructive:
          "border-transparent bg-gradient-to-r from-error to-error-600 text-white hover:from-error-600 hover:to-error-700 dark:from-error-700 dark:to-error-900",
        outline:
          "text-primary border-primary bg-transparent hover:bg-primary hover:text-white dark:text-primary-300 dark:border-primary-700 dark:hover:bg-primary-800 dark:hover:text-white",
        accent:
          "border-transparent bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 dark:from-accent-700 dark:to-accent-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
