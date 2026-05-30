import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreateLeaseMutation } from '../application/use-create-lease-mutation'
import { useLeaseFormOptionsQuery } from '../application/use-lease-form-options-query'
import {
  createLeaseSchema,
  type CreateLeaseFormValues,
  type CreateLeaseInput,
} from '../domain/create-lease-schema'

function formatUnitOption(name: string, propertyName: string | null) {
  return propertyName === null ? name : `${name} - ${propertyName}`
}

export function CreateLeasePage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const formOptionsQuery = useLeaseFormOptionsQuery()
  const createLeaseMutation = useCreateLeaseMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateLeaseFormValues, unknown, CreateLeaseInput>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: {
      tenant_id: '',
      unit_id: '',
      start_date: '',
      end_date: '',
      monthly_rent_amount: '',
      billing_day: '',
      deposit_amount: '',
    },
  })

  const isSubmitting = createLeaseMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const formOptions = formOptionsQuery.data ?? null
  const hasFormOptions =
    formOptions !== null &&
    formOptions.tenants.length > 0 &&
    formOptions.units.length > 0

  return (
    <AppLayout>
      <section
        className="create-lease-page"
        aria-labelledby="create-lease-title"
      >
        <div className="create-lease-page__header">
          <div>
            <h2 id="create-lease-title">Add lease</h2>
            <p>
              Connect one tenant to one unit with agreement dates and billing
              terms. Occupancy status and rent billing are handled separately.
            </p>
          </div>
          <Link to={routePaths.dashboardLeases}>Back to leases</Link>
        </div>

        {formOptionsQuery.isLoading ? (
          <p className="create-lease-page__status">Loading lease options...</p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="create-lease-page__error" role="alert">
            We could not load tenants and units right now. Please try again
            later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && !hasFormOptions ? (
          <div className="create-lease-page__empty">
            <h3>Tenant and unit records required</h3>
            <p>
              Create at least one tenant and one unit before adding a lease.
            </p>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess && hasFormOptions ? (
          <form
            className="lease-form"
            onSubmit={handleSubmit((input) => {
              if (organizationId === null) {
                return
              }

              createLeaseMutation.mutate(
                { organizationId, input },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardLeases)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="lease-form__field">
              <label htmlFor="lease-tenant">Tenant</label>
              <select
                id="lease-tenant"
                disabled={isSubmitting}
                aria-invalid={errors.tenant_id ? 'true' : 'false'}
                {...register('tenant_id')}
              >
                <option value="">Select a tenant</option>
                {formOptions.tenants.map((tenant) => (
                  <option value={tenant.id} key={tenant.id}>
                    {tenant.full_name}
                  </option>
                ))}
              </select>
              {errors.tenant_id?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.tenant_id.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-unit">Unit</label>
              <select
                id="lease-unit"
                disabled={isSubmitting}
                aria-invalid={errors.unit_id ? 'true' : 'false'}
                {...register('unit_id')}
              >
                <option value="">Select a unit</option>
                {formOptions.units.map((unit) => (
                  <option value={unit.id} key={unit.id}>
                    {formatUnitOption(unit.name, unit.property_name)}
                  </option>
                ))}
              </select>
              {errors.unit_id?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.unit_id.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-start-date">Start date</label>
              <input
                id="lease-start-date"
                type="date"
                disabled={isSubmitting}
                aria-invalid={errors.start_date ? 'true' : 'false'}
                {...register('start_date')}
              />
              {errors.start_date?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-end-date">End date</label>
              <input
                id="lease-end-date"
                type="date"
                disabled={isSubmitting}
                aria-invalid={errors.end_date ? 'true' : 'false'}
                {...register('end_date')}
              />
              {errors.end_date?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.end_date.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-monthly-rent">Monthly rent</label>
              <input
                id="lease-monthly-rent"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.monthly_rent_amount ? 'true' : 'false'}
                {...register('monthly_rent_amount')}
              />
              {errors.monthly_rent_amount?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.monthly_rent_amount.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-billing-day">Billing day</label>
              <input
                id="lease-billing-day"
                type="number"
                min="1"
                max="31"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.billing_day ? 'true' : 'false'}
                {...register('billing_day')}
              />
              {errors.billing_day?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.billing_day.message}
                </p>
              ) : null}
            </div>

            <div className="lease-form__field">
              <label htmlFor="lease-deposit">Deposit</label>
              <input
                id="lease-deposit"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                disabled={isSubmitting}
                aria-invalid={errors.deposit_amount ? 'true' : 'false'}
                {...register('deposit_amount')}
              />
              {errors.deposit_amount?.message ? (
                <p className="lease-form__error" role="alert">
                  {errors.deposit_amount.message}
                </p>
              ) : null}
            </div>

            {currentProfileQuery.isError ? (
              <p className="lease-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createLeaseMutation.isError ? (
              <p className="lease-form__error" role="alert">
                We could not create this lease. Please check the details and try
                again.
              </p>
            ) : null}

            <div className="lease-form__actions">
              <Link to={routePaths.dashboardLeases}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentProfileQuery.isLoading ||
                  organizationId === null
                }
              >
                {isSubmitting ? 'Creating lease...' : 'Create lease'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
