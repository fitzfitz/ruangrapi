import { createContext, useContext } from 'react'

import type { AuthSessionState } from './auth-session-types'

export const AuthSessionContext = createContext<AuthSessionState | undefined>(
  undefined,
)

export function useAuthSession(): AuthSessionState {
  const authSession = useContext(AuthSessionContext)

  if (authSession === undefined) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider')
  }

  return authSession
}
