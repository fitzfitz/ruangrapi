import { Link } from 'react-router-dom'

import { AppLayout } from '../../app/layouts'
import { routePaths } from '../../app/router/route-paths'
import { SignUpForm } from './sign-up-form'

export function SignUpPage() {
  return (
    <AppLayout>
      <section className="auth-page" aria-labelledby="signup-title">
        <div className="auth-page__intro">
          <h2 id="signup-title">Create your RuangRapi account</h2>
          <p>Use your email and password to start your account setup.</p>
        </div>

        <SignUpForm />

        <p className="auth-page__link">
          Already have an account? <Link to={routePaths.auth}>Sign in</Link>.
        </p>
      </section>
    </AppLayout>
  )
}
