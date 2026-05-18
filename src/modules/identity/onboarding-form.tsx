import { type FormEvent, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabaseClient } from '../../shared/lib'

const fieldLength = {
  min: 2,
  max: 120,
} as const

const organizationNameError =
  'Organization name must be between 2 and 120 characters.'
const fullNameError = 'Full name must be between 2 and 120 characters.'
const submitError = 'We could not complete setup. Please try again.'

type OnboardingFormValues = {
  organizationName: string
  fullName: string
}

function validateField(value: string): boolean {
  const trimmedValue = value.trim()

  return (
    trimmedValue.length >= fieldLength.min &&
    trimmedValue.length <= fieldLength.max
  )
}

function validateForm(values: OnboardingFormValues): string | null {
  if (!validateField(values.organizationName)) {
    return organizationNameError
  }

  if (!validateField(values.fullName)) {
    return fullNameError
  }

  return null
}

export function OnboardingForm() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<OnboardingFormValues>({
    organizationName: '',
    fullName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateForm(values)

    if (validationError !== null) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const organizationName = values.organizationName.trim()
    const fullName = values.fullName.trim()

    try {
      const { error } = await supabaseClient.rpc('complete_onboarding', {
        organization_name: organizationName,
        full_name: fullName,
      })

      if (error !== null) {
        setErrorMessage(submitError)
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['identity'] })
    } catch {
      setErrorMessage(submitError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
      <div className="onboarding-form__field">
        <label htmlFor="organization_name">Organization name</label>
        <input
          id="organization_name"
          name="organization_name"
          type="text"
          autoComplete="organization"
          value={values.organizationName}
          disabled={isSubmitting}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              organizationName: event.target.value,
            }))
          }}
        />
      </div>

      <div className="onboarding-form__field">
        <label htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          value={values.fullName}
          disabled={isSubmitting}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              fullName: event.target.value,
            }))
          }}
        />
      </div>

      {errorMessage !== null ? (
        <p className="onboarding-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Completing setup...' : 'Complete setup'}
      </button>
    </form>
  )
}
