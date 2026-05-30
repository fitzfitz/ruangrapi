import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreateInvoiceMutation } from '../application/use-create-invoice-mutation'
import { useInvoiceFormOptionsQuery } from '../application/use-invoice-form-options-query'
import {
  createInvoiceSchema,
  type CreateInvoiceFormValues,
  type CreateInvoiceInput,
} from '../domain/create-invoice-schema'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLeaseOption(
  tenantName: string,
  unitName: string,
  propertyName: string | null,
) {
  const location =
    propertyName === null ? unitName : `${unitName} - ${propertyName}`

  return `${tenantName} / ${location}`
}

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const formOptionsQuery = useInvoiceFormOptionsQuery()
  const createInvoiceMutation = useCreateInvoiceMutation()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateInvoiceFormValues, unknown, CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      lease_id: '',
      billing_period: '',
      notes: '',
    },
  })
  const selectedLeaseId = useWatch({ control, name: 'lease_id' })

  const isSubmitting = createInvoiceMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const formOptions = formOptionsQuery.data ?? null
  const hasFormOptions = formOptions !== null && formOptions.leases.length > 0
  const selectedLease = useMemo(
    () =>
      formOptions?.leases.find((lease) => lease.id === selectedLeaseId) ?? null,
    [formOptions, selectedLeaseId],
  )

  return (
    <AppLayout>
      <section
        className="create-invoice-page"
        aria-labelledby="create-invoice-title"
      >
        <div className="create-invoice-page__header">
          <div>
            <h2 id="create-invoice-title">Add invoice</h2>
            <p>
              Create one draft rent invoice from an active lease. Payments,
              receipts, reminders, and sending workflows stay separate.
            </p>
          </div>
          <Link to={routePaths.dashboardInvoices}>Back to invoices</Link>
        </div>

        {formOptionsQuery.isLoading ? (
          <p className="create-invoice-page__status">
            Loading active leases...
          </p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="create-invoice-page__error" role="alert">
            We could not load active leases right now. Please try again later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && !hasFormOptions ? (
          <div className="create-invoice-page__empty">
            <h3>No active leases available</h3>
            <p>Create an active lease before adding a draft rent invoice.</p>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess && hasFormOptions ? (
          <form
            className="invoice-form"
            onSubmit={handleSubmit((input) => {
              if (organizationId === null) {
                return
              }

              createInvoiceMutation.mutate(
                { organizationId, input },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardInvoices)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="invoice-form__field">
              <label htmlFor="invoice-lease">Lease</label>
              <select
                id="invoice-lease"
                disabled={isSubmitting}
                aria-invalid={errors.lease_id ? 'true' : 'false'}
                {...register('lease_id')}
              >
                <option value="">Select an active lease</option>
                {formOptions.leases.map((lease) => (
                  <option value={lease.id} key={lease.id}>
                    {formatLeaseOption(
                      lease.tenant_name,
                      lease.unit_name,
                      lease.property_name,
                    )}
                  </option>
                ))}
              </select>
              {errors.lease_id?.message ? (
                <p className="invoice-form__error" role="alert">
                  {errors.lease_id.message}
                </p>
              ) : null}
            </div>

            {selectedLease !== null ? (
              <div className="invoice-form__context">
                <span className="invoice-form__context-label">
                  Invoice source
                </span>
                <p>
                  {selectedLease.tenant_name} / {selectedLease.unit_name}
                  {selectedLease.property_name === null
                    ? ''
                    : ` - ${selectedLease.property_name}`}
                </p>
                <p>
                  Monthly rent:{' '}
                  {formatCurrency(selectedLease.monthly_rent_amount)}
                </p>
              </div>
            ) : null}

            <div className="invoice-form__field">
              <label htmlFor="invoice-billing-period">Billing period</label>
              <input
                id="invoice-billing-period"
                type="month"
                disabled={isSubmitting}
                aria-invalid={errors.billing_period ? 'true' : 'false'}
                {...register('billing_period')}
              />
              {errors.billing_period?.message ? (
                <p className="invoice-form__error" role="alert">
                  {errors.billing_period.message}
                </p>
              ) : null}
            </div>

            <div className="invoice-form__field">
              <label htmlFor="invoice-notes">Notes</label>
              <textarea
                id="invoice-notes"
                rows={4}
                disabled={isSubmitting}
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              />
              {errors.notes?.message ? (
                <p className="invoice-form__error" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            {currentProfileQuery.isError ? (
              <p className="invoice-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createInvoiceMutation.isError ? (
              <p className="invoice-form__error" role="alert">
                We could not create this invoice. Please check the details and
                try again.
              </p>
            ) : null}

            <div className="invoice-form__actions">
              <Link to={routePaths.dashboardInvoices}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentProfileQuery.isLoading ||
                  organizationId === null
                }
              >
                {isSubmitting ? 'Creating invoice...' : 'Create invoice'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
