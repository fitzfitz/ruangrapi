import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-extrabold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-teal-800',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-red-800',
        outline:
          'border border-border bg-card text-foreground shadow-sm hover:border-[var(--border-strong)] hover:bg-secondary',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-orange-100',
        ghost: 'text-foreground hover:bg-secondary',
        link: 'h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    children?: React.ReactNode
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      className: cn(
        buttonVariants({ variant, size, className }),
        children.props.className,
      ),
    })
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
