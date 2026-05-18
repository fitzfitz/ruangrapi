import { useEffect } from 'react'

import type { AppAccountState } from './app-account-state-types'
import { useAuthSession } from './use-auth-session'
import { useCurrentOrganizationQuery } from './use-current-organization-query'
import { useCurrentProfileQuery } from './use-current-profile-query'

const accountSetupIncompleteError = new Error('Account setup is incomplete')

function toAccountSetupError(error: unknown): unknown {
  return error ?? accountSetupIncompleteError
}

export function useAppAccountState(): AppAccountState {
  const authSession = useAuthSession()
  const currentProfileQuery = useCurrentProfileQuery()
  const currentOrganizationQuery = useCurrentOrganizationQuery()

  const profile = currentProfileQuery.data ?? null
  const organization = currentOrganizationQuery.data ?? null

  let accountState: AppAccountState

  if (authSession.isLoading) {
    accountState = {
      status: 'checking_session',
      session: authSession.session,
      user: authSession.user,
      profile: null,
      organization: null,
      error: authSession.error,
      signOut: authSession.signOut,
    }
  } else if (authSession.session === null || authSession.user === null) {
    accountState = {
      status: 'logged_out',
      session: authSession.session,
      user: authSession.user,
      profile: null,
      organization: null,
      error: authSession.error,
      signOut: authSession.signOut,
    }
  } else if (authSession.error !== null || currentProfileQuery.error !== null) {
    accountState = {
      status: 'account_setup_error',
      session: authSession.session,
      user: authSession.user,
      profile,
      organization: null,
      error: toAccountSetupError(
        authSession.error ?? currentProfileQuery.error,
      ),
      signOut: authSession.signOut,
    }
  } else if (currentProfileQuery.isLoading) {
    accountState = {
      status: 'checking_profile',
      session: authSession.session,
      user: authSession.user,
      profile: null,
      organization: null,
      error: null,
      signOut: authSession.signOut,
    }
  } else if (profile === null) {
    accountState = {
      status: 'needs_onboarding',
      session: authSession.session,
      user: authSession.user,
      profile: null,
      organization: null,
      error: null,
      signOut: authSession.signOut,
    }
  } else if (currentOrganizationQuery.error !== null) {
    accountState = {
      status: 'account_setup_error',
      session: authSession.session,
      user: authSession.user,
      profile,
      organization,
      error: toAccountSetupError(currentOrganizationQuery.error),
      signOut: authSession.signOut,
    }
  } else if (currentOrganizationQuery.isLoading) {
    accountState = {
      status: 'checking_organization',
      session: authSession.session,
      user: authSession.user,
      profile,
      organization: null,
      error: null,
      signOut: authSession.signOut,
    }
  } else if (organization === null) {
    accountState = {
      status: 'account_setup_error',
      session: authSession.session,
      user: authSession.user,
      profile,
      organization: null,
      error: toAccountSetupError(null),
      signOut: authSession.signOut,
    }
  } else {
    accountState = {
      status: 'ready',
      session: authSession.session,
      user: authSession.user,
      profile,
      organization,
      error: null,
      signOut: authSession.signOut,
    }
  }

  useEffect(() => {
    if (import.meta.env.DEV && accountState.status === 'account_setup_error') {
      console.error('RuangRapi account setup error', {
        error: accountState.error,
        organization,
        organizationError: currentOrganizationQuery.error,
        profile,
        profileError: currentProfileQuery.error,
        userId: authSession.user?.id ?? null,
      })
    }
  }, [
    accountState.error,
    accountState.status,
    authSession.user?.id,
    currentOrganizationQuery.error,
    currentProfileQuery.error,
    organization,
    profile,
  ])

  return accountState
}
