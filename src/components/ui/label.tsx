import * as React from 'react'
import { Field } from '@base-ui/react/field'

import { cn } from '@/lib/utils'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof Field.Label>) {
  return (
    <Field.Label
      data-slot="label"
      className={cn('text-sm font-bold text-foreground', className)}
      {...props}
    />
  )
}

export { Label }
