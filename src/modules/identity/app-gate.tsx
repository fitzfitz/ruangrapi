import { AppLayout } from '../../app/layouts'
import { DashboardShell } from '../dashboard'
import { AccountStatePlaceholder } from './account-state-placeholder'
import { useAppAccountState } from './use-app-account-state'

export function AppGate() {
  const accountState = useAppAccountState()

  return (
    <AppLayout>
      {accountState.status === 'ready' ? (
        <DashboardShell />
      ) : (
        <AccountStatePlaceholder status={accountState.status} />
      )}
    </AppLayout>
  )
}
