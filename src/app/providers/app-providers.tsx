import type { PropsWithChildren } from 'react'

import { QueryClientProvider } from './query-client-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return <QueryClientProvider>{children}</QueryClientProvider>
}
