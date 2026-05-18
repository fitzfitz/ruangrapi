import { AppLayout } from '../../app/layouts'

export function AuthPage() {
  return (
    <AppLayout>
      <section
        className="account-state-placeholder"
        aria-labelledby="auth-title"
      >
        <h2 id="auth-title">Signed out</h2>
        <p>Please sign in to continue.</p>
      </section>
    </AppLayout>
  )
}
