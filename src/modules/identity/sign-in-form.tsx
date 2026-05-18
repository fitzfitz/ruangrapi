import { type FormEvent, useState } from 'react'

import { supabaseClient } from '../../shared/lib'

const signInErrorMessage =
  'Unable to sign in. Please check your email and password.'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(signInErrorMessage)
      }
    } catch {
      setErrorMessage(signInErrorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="sign-in-form" onSubmit={handleSubmit}>
      <div className="sign-in-form__field">
        <label htmlFor="sign-in-email">Email</label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="sign-in-form__field">
        <label htmlFor="sign-in-password">Password</label>
        <input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      {errorMessage ? (
        <p className="sign-in-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
