import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AuthSessionContext } from '../../modules/identity/use-auth-session'
import type { AuthSessionState } from '../../modules/identity/auth-session-types'
import { supabaseClient } from '../../shared/lib/supabase-client'
import { queryClient } from './query-client'

function logAuthSessionError(message: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(message, error)
  }
}

function getUserId(session: Session | null): string | null {
  return session?.user.id ?? null
}

function shouldClearQueryCache(
  event: AuthChangeEvent,
  previousUserId: string | null,
  nextUserId: string | null,
): boolean {
  if (event === 'SIGNED_OUT') {
    return true
  }

  return (
    previousUserId !== null &&
    nextUserId !== null &&
    previousUserId !== nextUserId
  )
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadInitialSession() {
      setIsLoading(true)

      const { data, error: sessionError } =
        await supabaseClient.auth.getSession()

      if (!isMounted) {
        return
      }

      if (sessionError !== null) {
        logAuthSessionError(
          'Failed to load initial auth session.',
          sessionError,
        )
        setError(sessionError)
        setSession(null)
        currentUserIdRef.current = null
        setIsLoading(false)
        return
      }

      const nextSession = data.session
      setSession(nextSession)
      currentUserIdRef.current = getUserId(nextSession)
      setError(null)
      setIsLoading(false)
    }

    void loadInitialSession()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, nextSession) => {
      const previousUserId = currentUserIdRef.current
      const nextUserId = getUserId(nextSession)

      if (shouldClearQueryCache(event, previousUserId, nextUserId)) {
        queryClient.clear()
      }

      currentUserIdRef.current = nextUserId
      setSession(nextSession)
      setError(null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)

    const { error: signOutError } = await supabaseClient.auth.signOut()

    if (signOutError !== null) {
      logAuthSessionError('Failed to sign out.', signOutError)
      setError(signOutError)
      setIsLoading(false)
      throw signOutError
    }

    queryClient.clear()
    currentUserIdRef.current = null
    setSession(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthSessionState>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      error,
      signOut,
    }),
    [error, isLoading, session, signOut],
  )

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}
