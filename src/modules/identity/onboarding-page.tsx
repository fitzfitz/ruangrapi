import { AppLayout } from '../../app/layouts'

export function OnboardingPage() {
  return (
    <AppLayout>
      <section
        className="account-state-placeholder"
        aria-labelledby="onboarding-title"
      >
        <h2 id="onboarding-title">Workspace setup required</h2>
        <p>Complete your workspace setup to continue.</p>
      </section>
    </AppLayout>
  )
}
