import type { Session, User } from '@supabase/supabase-js'

import type { SignOut } from './auth-session-types'
import type { CurrentOrganization } from './organization-types'
import type { CurrentProfile } from './profile-types'

export type AppAccountStateStatus =
  | 'checking_session'
  | 'logged_out'
  | 'checking_profile'
  | 'needs_onboarding'
  | 'checking_organization'
  | 'ready'
  | 'account_setup_error'

export type AppAccountStateError = unknown | null

export type AppAccountState = {
  status: AppAccountStateStatus
  session: Session | null
  user: User | null
  profile: CurrentProfile | null
  organization: CurrentOrganization | null
  error: AppAccountStateError
  signOut: SignOut
}
