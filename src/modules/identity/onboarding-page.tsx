import { AppLayout } from '../../app/layouts'
import { OnboardingForm } from './onboarding-form'

export function OnboardingPage() {
  return (
    <AppLayout>
      <section className="onboarding-page" aria-labelledby="onboarding-title">
        <div className="onboarding-page__intro">
          <h2 id="onboarding-title">Set up your workspace</h2>
          <p>
            Add the basics for your rental business workspace before continuing
            to RuangRapi.
          </p>
        </div>

        <OnboardingForm />
      </section>
    </AppLayout>
  )
}
