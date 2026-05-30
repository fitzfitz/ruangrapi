import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useTenantQuery } from '../application/use-tenant-query'
import { useUpdateTenantMutation } from '../application/use-update-tenant-mutation'
import {
  tenantFormSchema,
  type TenantFormInput,
  type TenantFormValues,
} from '../domain/tenant-form-schema'

export function EditTenantPage() {
  const navigate = useNavigate()
  const { tenantId } = useParams<{ tenantId: string }>()
  const tenantQuery = useTenantQuery(tenantId)
  const updateTenantMutation = useUpdateTenantMutation()
  const lastInitializedTenantIdRef = useRef<string | null>(null)
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
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

  useEffect(() => {
    if (tenantQuery.data === null || tenantQuery.data === undefined) {
      return
    }

    const loadedTenantId = tenantQuery.data.id

    if (lastInitializedTenantIdRef.current === loadedTenantId && isDirty) {
      return
    }

    reset({
      full_name: tenantQuery.data.full_name,
      phone: tenantQuery.data.phone ?? '',
      email: tenantQuery.data.email ?? '',
      identity_notes: tenantQuery.data.identity_notes ?? '',
      emergency_contact_name: tenantQuery.data.emergency_contact_name ?? '',
      emergency_contact_phone: tenantQuery.data.emergency_contact_phone ?? '',
      notes: tenantQuery.data.notes ?? '',
    })
    lastInitializedTenantIdRef.current = loadedTenantId
  }, [isDirty, reset, tenantQuery.data])

  const isSubmitting = updateTenantMutation.isPending

  return (
    <AppLayout>
      <section className="edit-tenant-page" aria-labelledby="edit-tenant-title">
        <div className="edit-tenant-page__header">
          <div>
            <h2 id="edit-tenant-title">Edit tenant</h2>
            <p>
              Update this renter contact record. Lease and unit assignment
              workflows stay outside this module.
            </p>
          </div>
          <Link to={routePaths.dashboardTenants}>Back to tenants</Link>
        </div>

        {!tenantId ? (
          <div className="edit-tenant-page__empty">
            <h3>Tenant not found</h3>
            <p>This tenant is missing or is not accessible to your account.</p>
          </div>
        ) : null}

        {tenantQuery.isLoading ? (
          <p className="edit-tenant-page__status">Loading tenant...</p>
        ) : null}

        {tenantQuery.isError ? (
          <p className="edit-tenant-page__error" role="alert">
            We could not load this tenant right now. Please try again later.
          </p>
        ) : null}

        {tenantQuery.isSuccess && tenantQuery.data === null ? (
          <div className="edit-tenant-page__empty">
            <h3>Tenant not found</h3>
            <p>
              This tenant may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {tenantQuery.isSuccess && tenantQuery.data !== null ? (
          <form
            className="tenant-form"
            onSubmit={handleSubmit((input) => {
              if (!tenantId) {
                return
              }

              updateTenantMutation.mutate(
                { tenantId, input },
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

            {updateTenantMutation.isError ? (
              <p className="tenant-form__error" role="alert">
                We could not update this tenant. Please check the details and
                try again.
              </p>
            ) : null}

            <div className="tenant-form__actions">
              <Link to={routePaths.dashboardTenants}>Cancel</Link>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving tenant...' : 'Save tenant'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
