import { type FormEvent, useState } from 'react'

import { supabaseClient } from '../../shared/lib'

const minimumPasswordLength = 8
const signUpErrorMessage = 'Unable to create your account. Please try again.'
const signUpSuccessMessage =
  'Account created. Please check your email to confirm your signup if confirmation is required.'

function validateSignUpForm(
  email: string,
  password: string,
  confirmPassword: string,
) {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!password) {
    return 'Password is required.'
  }

  if (password.length < minimumPasswordLength) {
    return 'Password must be at least 8 characters.'
  }

  if (confirmPassword !== password) {
    return 'Confirm password must match password.'
  }

  return null
}

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    const validationMessage = validateSignUpForm(
      email,
      password,
      confirmPassword,
    )

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(signUpErrorMessage)
        return
      }

      setSuccessMessage(signUpSuccessMessage)
      setPassword('')
      setConfirmPassword('')
    } catch {
      setErrorMessage(signUpErrorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="sign-up-form" onSubmit={handleSubmit}>
      <div className="sign-up-form__field">
        <label htmlFor="sign-up-email">Email</label>
        <input
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="sign-up-form__field">
        <label htmlFor="sign-up-password">Password</label>
        <input
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          minLength={minimumPasswordLength}
          required
        />
      </div>

      <div className="sign-up-form__field">
        <label htmlFor="sign-up-confirm-password">Confirm password</label>
        <input
          id="sign-up-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
          minLength={minimumPasswordLength}
          required
        />
      </div>

      {errorMessage ? (
        <p className="sign-up-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="sign-up-form__success" role="status">
          {successMessage}
        </p>
      ) : null}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
