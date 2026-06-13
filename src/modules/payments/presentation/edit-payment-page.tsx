import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { usePaymentEditQuery } from '../application/use-payment-edit-query'
import { useUpdatePaymentMutation } from '../application/use-update-payment-mutation'
import {
  editPaymentSchema,
  type EditPaymentFormValues,
  type EditPaymentInput,
} from '../domain/edit-payment-schema'
import type { PaymentEditDetail, PaymentMethod } from '../domain/payment'

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

function formatPropertyName(value: string | null) {
  return value ?? 'No property name'
}

function getDefaultValues(payment: PaymentEditDetail): EditPaymentFormValues {
  return {
    amount: payment.amount,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    reference_number: payment.reference_number ?? '',
    notes: payment.notes ?? '',
  }
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'e_wallet', label: 'E-wallet' },
  { value: 'other', label: 'Other' },
]

export function EditPaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const currentProfileQuery = useCurrentProfileQuery()
  const paymentQuery = usePaymentEditQuery(paymentId)
  const updatePaymentMutation = useUpdatePaymentMutation()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<EditPaymentFormValues, unknown, EditPaymentInput>({
    resolver: zodResolver(editPaymentSchema),
  })
  const amountValue = useWatch({ control, name: 'amount' })

  const payment = paymentQuery.data ?? null
  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const isSubmitting = updatePaymentMutation.isPending
  const numericAmount = Number(amountValue)
  const parsedAmount = Number.isFinite(numericAmount) ? numericAmount : null
  const exceedsEditableAllowance =
    payment !== null &&
    parsedAmount !== null &&
    parsedAmount > payment.invoice.editable_remaining_amount

  useEffect(() => {
    if (payment !== null) {
      reset(getDefaultValues(payment))
    }
  }, [payment, reset])

  async function onSubmit(input: EditPaymentInput) {
    if (!paymentId || organizationId === null || payment === null) {
      return
    }

    if (input.amount > payment.invoice.editable_remaining_amount) {
      setError('amount', {
        message: 'Amount cannot exceed the invoice editable allowance.',
        type: 'validate',
      })
      return
    }

    await updatePaymentMutation.mutateAsync({
      organizationId,
      paymentId,
      input,
    })

    void navigate(routePaths.dashboardPayments)
  }

  return (
    <AppLayout>
      <section
        className="edit-payment-page"
        aria-labelledby="edit-payment-title"
      >
        <div className="edit-payment-page__header">
          <div>
            <h2 id="edit-payment-title">Edit payment</h2>
            <p>
              Correct an unreceipted payment while keeping receipt-backed
              records locked.
            </p>
          </div>
          <Link to={routePaths.dashboardPayments}>Back to payments</Link>
        </div>

        {!paymentId ? (
          <div className="edit-payment-page__empty">
            <h3>Payment not found</h3>
            <p>This payment is missing or is not accessible to your account.</p>
          </div>
        ) : null}

        {paymentQuery.isLoading ? (
          <p className="edit-payment-page__status">Loading payment...</p>
        ) : null}

        {paymentQuery.isError ? (
          <p className="edit-payment-page__error" role="alert">
            We could not load this payment right now. Please try again later.
          </p>
        ) : null}

        {paymentQuery.isSuccess && payment === null ? (
          <div className="edit-payment-page__empty">
            <h3>Payment not found</h3>
            <p>This payment may not exist or may not be accessible to you.</p>
          </div>
        ) : null}

        {payment !== null && payment.receipt_id !== null ? (
          <div className="edit-payment-page__locked">
            <h3>Receipt issued</h3>
            <p>
              Direct edits are blocked because this payment already has an
              issued receipt. Use a correction workflow in a later slice.
            </p>
            {payment.receipt_number !== null ? (
              <p>Receipt number: {payment.receipt_number}</p>
            ) : null}
          </div>
        ) : null}

        {payment !== null && payment.receipt_id === null ? (
          <form
            className="payment-form command-form-card"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="form-section">
              <h3>Invoice Context & Balance</h3>
              <p className="form-section__helper">
                Review the fixed invoice assignment and the current editable
                allowance before saving.
              </p>

              <div className="payment-form__context">
                <span className="payment-form__context-label">
                  Fixed invoice
                </span>
                <p>
                  {payment.invoice.tenant_name} / {payment.invoice.unit_name} -{' '}
                  {formatPropertyName(payment.invoice.property_name)}
                </p>
                <dl>
                  <div>
                    <dt>Billing period</dt>
                    <dd>
                      {formatBillingPeriod(payment.invoice.billing_period)}
                    </dd>
                  </div>
                  <div>
                    <dt>Invoice total</dt>
                    <dd>{formatCurrency(payment.invoice.total_amount)}</dd>
                  </div>
                  <div>
                    <dt>Currently paid</dt>
                    <dd>{formatCurrency(payment.invoice.paid_amount)}</dd>
                  </div>
                  <div>
                    <dt>Editable allowance</dt>
                    <dd>
                      {formatCurrency(
                        payment.invoice.editable_remaining_amount,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Details</h3>
              <p className="form-section__helper">
                Update the received amount, date, and method. The invoice
                assignment remains locked.
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
                    errors.amount || exceedsEditableAllowance ? 'true' : 'false'
                  }
                  {...register('amount')}
                />
                {errors.amount?.message ? (
                  <p className="payment-form__error" role="alert">
                    {errors.amount.message}
                  </p>
                ) : null}
                {!errors.amount && exceedsEditableAllowance ? (
                  <p className="payment-form__error" role="alert">
                    Amount cannot exceed the invoice editable allowance.
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
                  {paymentMethodOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                Update optional transaction references or internal notes.
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

            {updatePaymentMutation.isError ? (
              <p className="payment-form__error" role="alert">
                We could not update this payment. Please check the details and
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
                  exceedsEditableAllowance
                }
              >
                {isSubmitting ? 'Saving payment...' : 'Save payment'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
