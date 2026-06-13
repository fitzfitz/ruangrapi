import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { useCreatePaymentMutation } from '../application/use-create-payment-mutation'
import { usePaymentFormOptionsQuery } from '../application/use-payment-form-options-query'
import {
  createPaymentSchema,
  type CreatePaymentFormValues,
  type CreatePaymentInput,
} from '../domain/create-payment-schema'
import type { PaymentInvoiceOption } from '../infrastructure/payments-repository'

function getTodayDateValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatBillingPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatInvoiceOption(invoice: PaymentInvoiceOption) {
  const propertyName =
    invoice.property_name === null ? 'No property name' : invoice.property_name

  return `${invoice.tenant_name} / ${invoice.unit_name} - ${propertyName} / ${formatBillingPeriod(
    invoice.billing_period,
  )}`
}

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const formOptionsQuery = usePaymentFormOptionsQuery()
  const createPaymentMutation = useCreatePaymentMutation()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CreatePaymentFormValues, unknown, CreatePaymentInput>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      invoice_id: '',
      amount: '',
      payment_date: getTodayDateValue(),
      payment_method: 'bank_transfer',
      reference_number: '',
      notes: '',
    },
  })
  const selectedInvoiceId = useWatch({ control, name: 'invoice_id' })
  const amountValue = useWatch({ control, name: 'amount' })

  const isSubmitting = createPaymentMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const formOptions = formOptionsQuery.data ?? null
  const hasFormOptions = formOptions !== null && formOptions.invoices.length > 0
  const selectedInvoice = useMemo(
    () =>
      formOptions?.invoices.find(
        (invoice) => invoice.id === selectedInvoiceId,
      ) ?? null,
    [formOptions, selectedInvoiceId],
  )
  const parsedAmount = /^\d+$/.test(amountValue) ? Number(amountValue) : null
  const exceedsRemainingBalance =
    selectedInvoice !== null &&
    parsedAmount !== null &&
    parsedAmount > selectedInvoice.remaining_amount

  return (
    <AppLayout>
      <section
        className="create-payment-page"
        aria-labelledby="create-payment-title"
      >
        <div className="create-payment-page__header">
          <div>
            <h2 id="create-payment-title">Record payment</h2>
            <p>
              Record one manual payment against a payable invoice. Receipts,
              edits, corrections, and gateway workflows stay separate.
            </p>
          </div>
          <Link to={routePaths.dashboardPayments}>Back to payments</Link>
        </div>

        {formOptionsQuery.isLoading ? (
          <p className="create-payment-page__status">
            Loading payable invoices...
          </p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="create-payment-page__error" role="alert">
            We could not load payable invoices right now. Please try again
            later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && !hasFormOptions ? (
          <div className="create-payment-page__empty">
            <h3>No payable invoices available</h3>
            <p>Issue an invoice before recording a payment.</p>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess && hasFormOptions ? (
          <form
            className="payment-form command-form-card"
            onSubmit={handleSubmit((input) => {
              if (organizationId === null) {
                return
              }

              const invoice = formOptions.invoices.find(
                (option) => option.id === input.invoice_id,
              )

              if (
                invoice !== undefined &&
                input.amount > invoice.remaining_amount
              ) {
                setError('amount', {
                  message:
                    'Amount cannot exceed the invoice remaining balance.',
                  type: 'validate',
                })
                return
              }

              createPaymentMutation.mutate(
                { organizationId, input },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardPayments)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="form-section">
              <h3>Invoice Context & Balance</h3>
              <p className="form-section__helper">
                Select the target invoice to apply the payment toward and verify
                the balance.
              </p>

              <div className="payment-form__field">
                <label htmlFor="payment-invoice">Invoice</label>
                <select
                  id="payment-invoice"
                  disabled={isSubmitting}
                  aria-invalid={errors.invoice_id ? 'true' : 'false'}
                  {...register('invoice_id')}
                >
                  <option value="">Select a payable invoice</option>
                  {formOptions.invoices.map((invoice) => (
                    <option value={invoice.id} key={invoice.id}>
                      {formatInvoiceOption(invoice)}
                    </option>
                  ))}
                </select>
                {errors.invoice_id?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.invoice_id.message}
                  </p>
                ) : null}
              </div>

              {selectedInvoice !== null ? (
                <div className="payment-form__context">
                  <span className="payment-form__context-label">
                    Invoice balance
                  </span>
                  <p>
                    {selectedInvoice.tenant_name} / {selectedInvoice.unit_name}
                    {selectedInvoice.property_name === null
                      ? ''
                      : ` - ${selectedInvoice.property_name}`}
                  </p>
                  <dl>
                    <div>
                      <dt>Total</dt>
                      <dd>{formatCurrency(selectedInvoice.total_amount)}</dd>
                    </div>
                    <div>
                      <dt>Paid</dt>
                      <dd>{formatCurrency(selectedInvoice.paid_amount)}</dd>
                    </div>
                    <div>
                      <dt>Remaining</dt>
                      <dd>
                        {formatCurrency(selectedInvoice.remaining_amount)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>

            <div className="form-section">
              <h3>Payment Details</h3>
              <p className="form-section__helper">
                Enter the transaction date, total amount, and payment method
                used.
              </p>

              <div className="payment-form__field">
                <label htmlFor="payment-date">Payment date</label>
                <input
                  id="payment-date"
                  type="date"
                  disabled={isSubmitting}
                  aria-invalid={errors.payment_date ? 'true' : 'false'}
                  {...register('payment_date')}
                />
                {errors.payment_date?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.payment_date.message}
                  </p>
                ) : null}
              </div>

              <div className="payment-form__field">
                <label htmlFor="payment-amount">Amount</label>
                <input
                  id="payment-amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  disabled={isSubmitting}
                  aria-invalid={
                    errors.amount || exceedsRemainingBalance ? 'true' : 'false'
                  }
                  {...register('amount')}
                />
                {errors.amount?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.amount.message}
                  </p>
                ) : null}
                {!errors.amount && exceedsRemainingBalance ? (
                  <p className="payment-form__error" role="alert">
                    Amount cannot exceed the invoice remaining balance.
                  </p>
                ) : null}
              </div>

              <div className="payment-form__field">
                <label htmlFor="payment-method">Payment method</label>
                <select
                  id="payment-method"
                  disabled={isSubmitting}
                  aria-invalid={errors.payment_method ? 'true' : 'false'}
                  {...register('payment_method')}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="e_wallet">E-wallet</option>
                  <option value="other">Other</option>
                </select>
                {errors.payment_method?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.payment_method.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="form-section">
              <h3>Reference & Notes</h3>
              <p className="form-section__helper">
                Optionally add a transaction ID or memo for administrative
                record-keeping.
              </p>

              <div className="payment-form__field">
                <label htmlFor="payment-reference">Reference number</label>
                <input
                  id="payment-reference"
                  type="text"
                  disabled={isSubmitting}
                  aria-invalid={errors.reference_number ? 'true' : 'false'}
                  {...register('reference_number')}
                />
                {errors.reference_number?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.reference_number.message}
                  </p>
                ) : null}
              </div>

              <div className="payment-form__field">
                <label htmlFor="payment-notes">Notes</label>
                <textarea
                  id="payment-notes"
                  rows={4}
                  disabled={isSubmitting}
                  aria-invalid={errors.notes ? 'true' : 'false'}
                  {...register('notes')}
                />
                {errors.notes?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.notes.message}
                  </p>
                ) : null}
              </div>
            </div>

            {currentProfileQuery.isError ? (
              <p className="payment-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createPaymentMutation.isError ? (
              <p className="payment-form__error" role="alert">
                We could not record this payment. Please check the details and
                try again.
              </p>
            ) : null}

            <div className="payment-form__actions">
              <Link to={routePaths.dashboardPayments}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentProfileQuery.isLoading ||
                  organizationId === null ||
                  exceedsRemainingBalance
                }
              >
                {isSubmitting ? 'Recording payment...' : 'Record payment'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
