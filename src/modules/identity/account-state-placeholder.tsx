import type { AppAccountStateStatus } from './app-account-state-types'

type AccountStatePlaceholderProps = {
  status: Exclude<AppAccountStateStatus, 'ready'>
}

const placeholderCopy: Record<
  Exclude<AppAccountStateStatus, 'ready'>,
  { title: string; message: string }
> = {
  checking_session: {
    title: 'Checking session',
    message: 'Preparing your workspace...',
  },
  logged_out: {
    title: 'Signed out',
    message: 'Please sign in to continue.',
  },
  checking_profile: {
    title: 'Checking profile',
    message: 'Loading your account profile...',
  },
  needs_onboarding: {
    title: 'Workspace setup required',
    message: 'Complete your workspace setup to continue.',
  },
  checking_organization: {
    title: 'Checking workspace',
    message: 'Loading your workspace...',
  },
  account_setup_error: {
    title: 'Account setup incomplete',
    message:
      'Your account setup is incomplete. Please contact support or try again.',
  },
}

export function AccountStatePlaceholder({
  status,
}: AccountStatePlaceholderProps) {
  const copy = placeholderCopy[status]

  return (
    <section
      className="account-state-placeholder"
      aria-labelledby="account-state-title"
    >
      <h2 id="account-state-title">{copy.title}</h2>
      <p>{copy.message}</p>
    </section>
  )
}
