import type { PropsWithChildren } from 'react'

import { AuthSessionProvider } from './auth-session-provider'
import { QueryClientProvider } from './query-client-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </QueryClientProvider>
  )
}
