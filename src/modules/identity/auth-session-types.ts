import type { Session, User } from '@supabase/supabase-js'

export type AuthSessionError = Error

export type SignOut = () => Promise<void>

export type AuthSessionState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: AuthSessionError | null
  signOut: SignOut
}
