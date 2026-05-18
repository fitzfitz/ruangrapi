import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { AppLayout } from '../../app/layouts'
import { routePaths } from '../../app/router/route-paths'
import type { AppAccountStateStatus } from './app-account-state-types'
import { AccountStatePlaceholder } from './account-state-placeholder'
import { useAppAccountState } from './use-app-account-state'

type RouteAccessGateRoute = 'home' | 'auth' | 'onboarding' | 'dashboard'

type RouteAccessGateProps = {
  route: RouteAccessGateRoute
  children?: ReactNode
}

type RedirectStatus = Extract<
  AppAccountStateStatus,
  'logged_out' | 'needs_onboarding' | 'ready'
>

type RenderableStatus = Exclude<AppAccountStateStatus, RedirectStatus>

function isCheckingStatus(
  status: AppAccountStateStatus,
): status is Extract<
  AppAccountStateStatus,
  'checking_session' | 'checking_profile' | 'checking_organization'
> {
  return (
    status === 'checking_session' ||
    status === 'checking_profile' ||
    status === 'checking_organization'
  )
}

function renderPlaceholder(status: RenderableStatus) {
  return (
    <AppLayout>
      <AccountStatePlaceholder status={status} />
    </AppLayout>
  )
}

function redirectTo(path: string) {
  return <Navigate to={path} replace />
}

export function RouteAccessGate({ children, route }: RouteAccessGateProps) {
  const accountState = useAppAccountState()

  if (isCheckingStatus(accountState.status)) {
    return renderPlaceholder(accountState.status)
  }

  if (accountState.status === 'account_setup_error') {
    return renderPlaceholder(accountState.status)
  }

  if (accountState.status === 'logged_out') {
    return route === 'auth' ? children : redirectTo(routePaths.auth)
  }

  if (accountState.status === 'needs_onboarding') {
    return route === 'onboarding' ? children : redirectTo(routePaths.onboarding)
  }

  if (accountState.status === 'ready') {
    return route === 'dashboard' ? children : redirectTo(routePaths.dashboard)
  }

  return null
}
