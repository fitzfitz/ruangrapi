import { QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { queryClient } from './query-client'

export function QueryClientProvider({ children }: PropsWithChildren) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}
