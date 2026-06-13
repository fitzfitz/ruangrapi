import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentOrganizationQuery } from '../../identity'
import { useCreateMaintenanceTicketMutation } from '../application/use-create-maintenance-ticket-mutation'
import { useMaintenanceFormOptionsQuery } from '../application/use-maintenance-form-options-query'
import {
  createMaintenanceTicketSchema,
  type CreateMaintenanceTicketFormValues,
} from '../domain/create-maintenance-ticket-schema'

type ParsedMaintenanceTicketValues = ReturnType<
  typeof createMaintenanceTicketSchema.parse
>

function getTodayDateValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toReportedAtIsoString(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString()
}

export function CreateMaintenanceTicketPage() {
  const navigate = useNavigate()
  const currentOrganizationQuery = useCurrentOrganizationQuery()
  const formOptionsQuery = useMaintenanceFormOptionsQuery()
  const createMaintenanceTicketMutation = useCreateMaintenanceTicketMutation()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<
    CreateMaintenanceTicketFormValues,
    unknown,
    ParsedMaintenanceTicketValues
  >({
    resolver: zodResolver(createMaintenanceTicketSchema),
    defaultValues: {
      property_id: '',
      unit_id: '',
      title: '',
      description: '',
      priority: 'medium',
      reported_at: getTodayDateValue(),
      estimated_cost: '',
      actual_cost: '',
    },
  })
  const selectedPropertyId = useWatch({ control, name: 'property_id' })

  const isSubmitting = createMaintenanceTicketMutation.isPending
  const organization = currentOrganizationQuery.data ?? null
  const formOptions = formOptionsQuery.data ?? null
  const hasProperties =
    formOptions !== null && formOptions.properties.length > 0
  const filteredUnits = useMemo(
    () =>
      formOptions?.units.filter(
        (unit) => unit.property_id === selectedPropertyId,
      ) ?? [],
    [formOptions, selectedPropertyId],
  )

  useEffect(() => {
    setValue('unit_id', '')
  }, [selectedPropertyId, setValue])

  return (
    <AppLayout>
      <section
        className="create-maintenance-ticket-page"
        aria-labelledby="create-maintenance-ticket-title"
      >
        <div className="create-maintenance-ticket-page__header">
          <div>
            <h2 id="create-maintenance-ticket-title">Add maintenance ticket</h2>
            <p>
              Track a repair request for one property or unit with priority,
              report date, notes, and estimated or actual costs.
            </p>
          </div>
          <Link to={routePaths.dashboardMaintenance}>Back to maintenance</Link>
        </div>

        {formOptionsQuery.isLoading || currentOrganizationQuery.isLoading ? (
          <p className="create-maintenance-ticket-page__status">
            Loading maintenance ticket options...
          </p>
        ) : null}

        {formOptionsQuery.isError || currentOrganizationQuery.isError ? (
          <p className="create-maintenance-ticket-page__error" role="alert">
            We could not load maintenance ticket options right now. Please try
            again later.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && !hasProperties ? (
          <div className="create-maintenance-ticket-page__empty">
            <h3>No properties available</h3>
            <p>Create a property before adding maintenance tickets.</p>
            <Link to={routePaths.dashboardPropertiesNew}>Add property</Link>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess && hasProperties ? (
          <form
            className="maintenance-ticket-form command-form-card"
            onSubmit={handleSubmit((input) => {
              if (organization === null) {
                return
              }

              createMaintenanceTicketMutation.mutate(
                {
                  organization_id: organization.id,
                  property_id: input.property_id,
                  unit_id: input.unit_id,
                  title: input.title,
                  description: input.description,
                  priority: input.priority,
                  reported_at: toReportedAtIsoString(input.reported_at),
                  estimated_cost: input.estimated_cost,
                  actual_cost: input.actual_cost,
                },
                {
                  onSuccess: () => {
                    navigate(routePaths.dashboardMaintenance)
                  },
                },
              )
            })}
            noValidate
          >
            <div className="form-section">
              <h3>Ticket Description</h3>
              <p className="form-section__helper">
                Specify the property, unit, and details of the maintenance
                issue.
              </p>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-property">Property</label>
                <select
                  id="maintenance-ticket-property"
                  disabled={isSubmitting}
                  aria-invalid={errors.property_id ? 'true' : 'false'}
                  {...register('property_id')}
                >
                  <option value="">Select a property</option>
                  {formOptions.properties.map((property) => (
                    <option value={property.id} key={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {errors.property_id?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.property_id.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-unit">Unit</label>
                <select
                  id="maintenance-ticket-unit"
                  disabled={isSubmitting || selectedPropertyId.length === 0}
                  aria-invalid={errors.unit_id ? 'true' : 'false'}
                  {...register('unit_id')}
                >
                  <option value="">No unit / property-level issue</option>
                  {filteredUnits.map((unit) => (
                    <option value={unit.id} key={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {errors.unit_id?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.unit_id.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-title">Title</label>
                <input
                  id="maintenance-ticket-title"
                  type="text"
                  disabled={isSubmitting}
                  aria-invalid={errors.title ? 'true' : 'false'}
                  {...register('title')}
                />
                {errors.title?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-description">
                  Description
                </label>
                <textarea
                  id="maintenance-ticket-description"
                  rows={4}
                  disabled={isSubmitting}
                  aria-invalid={errors.description ? 'true' : 'false'}
                  {...register('description')}
                />
                {errors.description?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="form-section">
              <h3>Priority & Budget</h3>
              <p className="form-section__helper">
                Set the urgency level, report date, and estimated or actual cost
                details.
              </p>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-priority">Priority</label>
                <select
                  id="maintenance-ticket-priority"
                  disabled={isSubmitting}
                  aria-invalid={errors.priority ? 'true' : 'false'}
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.priority.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-reported-at">
                  Reported date
                </label>
                <input
                  id="maintenance-ticket-reported-at"
                  type="date"
                  disabled={isSubmitting}
                  aria-invalid={errors.reported_at ? 'true' : 'false'}
                  {...register('reported_at')}
                />
                {errors.reported_at?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.reported_at.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-estimated-cost">
                  Estimated cost
                </label>
                <input
                  id="maintenance-ticket-estimated-cost"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  disabled={isSubmitting}
                  aria-invalid={errors.estimated_cost ? 'true' : 'false'}
                  {...register('estimated_cost')}
                />
                {errors.estimated_cost?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.estimated_cost.message}
                  </p>
                ) : null}
              </div>

              <div className="maintenance-ticket-form__field">
                <label htmlFor="maintenance-ticket-actual-cost">
                  Actual cost
                </label>
                <input
                  id="maintenance-ticket-actual-cost"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  disabled={isSubmitting}
                  aria-invalid={errors.actual_cost ? 'true' : 'false'}
                  {...register('actual_cost')}
                />
                {errors.actual_cost?.message ? (
                  <p className="maintenance-ticket-form__error" role="alert">
                    {errors.actual_cost.message}
                  </p>
                ) : null}
              </div>
            </div>

            {currentOrganizationQuery.isError ||
            (currentOrganizationQuery.isSuccess && organization === null) ? (
              <p className="maintenance-ticket-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createMaintenanceTicketMutation.isError ? (
              <p className="maintenance-ticket-form__error" role="alert">
                We could not create this maintenance ticket. Please check the
                details and try again.
              </p>
            ) : null}

            <div className="maintenance-ticket-form__actions">
              <Link to={routePaths.dashboardMaintenance}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentOrganizationQuery.isLoading ||
                  organization === null
                }
              >
                {isSubmitting ? 'Creating ticket...' : 'Create ticket'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
