import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-extrabold leading-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-orange-200 bg-orange-50 text-orange-800',
        success: 'border-green-200 bg-green-50 text-green-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        destructive: 'border-red-200 bg-red-50 text-red-800',
        outline: 'border-border bg-card text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge }
