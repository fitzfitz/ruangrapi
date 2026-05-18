import { AppLayout } from '../../app/layouts'
import { SignInForm } from './sign-in-form'

export function AuthPage() {
  return (
    <AppLayout>
      <section className="auth-page" aria-labelledby="auth-title">
        <div className="auth-page__intro">
          <h2 id="auth-title">Sign in to RuangRapi</h2>
          <p>Use your email and password to continue.</p>
        </div>

        <SignInForm />
      </section>
    </AppLayout>
  )
}
