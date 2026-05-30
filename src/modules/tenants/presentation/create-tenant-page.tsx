import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreateTenantMutation } from '../application/use-create-tenant-mutation'
import {
  tenantFormSchema,
  type TenantFormInput,
  type TenantFormValues,
} from '../domain/tenant-form-schema'

export function CreateTenantPage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const createTenantMutation = useCreateTenantMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TenantFormValues, unknown, TenantFormInput>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      identity_notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    },
  })

  const isSubmitting = createTenantMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null

  return (
    <AppLayout>
      <section
        className="create-tenant-page"
        aria-labelledby="create-tenant-title"
      >
        <div className="create-tenant-page__header">
          <div>
            <h2 id="create-tenant-title">Add tenant</h2>
            <p>
              Create a renter contact record for your organization. Lease and
              unit assignment workflows will be added later.
            </p>
          </div>
          <Link to={routePaths.dashboardTenants}>Back to tenants</Link>
        </div>

        <form
          className="tenant-form"
          onSubmit={handleSubmit((input) => {
            if (organizationId === null) {
              return
            }

            createTenantMutation.mutate(
              { organizationId, input },
              {
                onSuccess: () => {
                  navigate(routePaths.dashboardTenants)
                },
              },
            )
          })}
          noValidate
        >
          <div className="tenant-form__field">
            <label htmlFor="tenant-full-name">Full name</label>
            <input
              id="tenant-full-name"
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={errors.full_name ? 'true' : 'false'}
              {...register('full_name')}
            />
            {errors.full_name?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.full_name.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-phone">Phone</label>
            <input
              id="tenant-phone"
              type="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              aria-invalid={errors.phone ? 'true' : 'false'}
              {...register('phone')}
            />
            {errors.phone?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-email">Email</label>
            <input
              id="tenant-email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-identity-notes">Identity notes</label>
            <textarea
              id="tenant-identity-notes"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={errors.identity_notes ? 'true' : 'false'}
              {...register('identity_notes')}
            />
            {errors.identity_notes?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.identity_notes.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-emergency-contact-name">
              Emergency contact name
            </label>
            <input
              id="tenant-emergency-contact-name"
              type="text"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={errors.emergency_contact_name ? 'true' : 'false'}
              {...register('emergency_contact_name')}
            />
            {errors.emergency_contact_name?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.emergency_contact_name.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-emergency-contact-phone">
              Emergency contact phone
            </label>
            <input
              id="tenant-emergency-contact-phone"
              type="tel"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={errors.emergency_contact_phone ? 'true' : 'false'}
              {...register('emergency_contact_phone')}
            />
            {errors.emergency_contact_phone?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.emergency_contact_phone.message}
              </p>
            ) : null}
          </div>

          <div className="tenant-form__field">
            <label htmlFor="tenant-notes">Notes</label>
            <textarea
              id="tenant-notes"
              rows={4}
              disabled={isSubmitting}
              aria-invalid={errors.notes ? 'true' : 'false'}
              {...register('notes')}
            />
            {errors.notes?.message ? (
              <p className="tenant-form__error" role="alert">
                {errors.notes.message}
              </p>
            ) : null}
          </div>

          {currentProfileQuery.isError ? (
            <p className="tenant-form__error" role="alert">
              We could not confirm your organization. Please try again later.
            </p>
          ) : null}

          {createTenantMutation.isError ? (
            <p className="tenant-form__error" role="alert">
              We could not create this tenant. Please check the details and try
              again.
            </p>
          ) : null}

          <div className="tenant-form__actions">
            <Link to={routePaths.dashboardTenants}>Cancel</Link>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                currentProfileQuery.isLoading ||
                organizationId === null
              }
            >
              {isSubmitting ? 'Creating tenant...' : 'Create tenant'}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}
