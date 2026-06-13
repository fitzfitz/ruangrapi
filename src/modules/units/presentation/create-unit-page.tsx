import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { useCurrentProfileQuery } from '../../identity'
import { usePropertyQuery } from '../../properties/application/use-property-query'
import { useCreateUnitMutation } from '../application/use-create-unit-mutation'
import {
  createUnitSchema,
  type CreateUnitFormValues,
  type CreateUnitInput,
} from '../domain/create-unit-schema'

function getPropertyDetailPath(propertyId: string) {
  return `${routePaths.dashboardProperties}/${propertyId}`
}

export function CreateUnitPage() {
  const navigate = useNavigate()
  const { propertyId } = useParams<{ propertyId: string }>()
  const propertyDetailPath = propertyId
    ? getPropertyDetailPath(propertyId)
    : routePaths.dashboardProperties
  const currentProfileQuery = useCurrentProfileQuery()
  const propertyQuery = usePropertyQuery(propertyId)
  const createUnitMutation = useCreateUnitMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateUnitFormValues, unknown, CreateUnitInput>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      name: '',
      type: '',
      notes: '',
    },
  })

  const isSubmitting = createUnitMutation.isPending
  const organizationId = currentProfileQuery.data?.organization_id ?? null
  const property = propertyQuery.data ?? null

  return (
    <AppLayout>
      <section className="create-unit-page" aria-labelledby="create-unit-title">
        <div className="create-unit-page__header">
          <div>
            <h2 id="create-unit-title">Add unit</h2>
            <p>
              Create a unit scoped to the selected property. Occupancy, rent,
              tenant, and lease workflows stay out of this slice.
            </p>
          </div>
          <Link to={propertyDetailPath}>Back to property</Link>
        </div>

        {!propertyId ? (
          <div className="create-unit-page__empty">
            <h3>Property not found</h3>
            <p>This unit needs a property before it can be created.</p>
          </div>
        ) : null}

        {propertyQuery.isLoading ? (
          <p className="create-unit-page__status">Loading property...</p>
        ) : null}

        {propertyQuery.isError ? (
          <p className="create-unit-page__error" role="alert">
            We could not load this property right now. Please try again later.
          </p>
        ) : null}

        {propertyQuery.isSuccess && property === null ? (
          <div className="create-unit-page__empty">
            <h3>Property not found</h3>
            <p>
              This property may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isSuccess && property !== null ? (
          <form
            className="create-unit-form command-form-card"
            onSubmit={handleSubmit((input) => {
              if (organizationId === null) {
                return
              }

              createUnitMutation.mutate(
                {
                  organizationId,
                  propertyId: property.id,
                  input,
                },
                {
                  onSuccess: () => {
                    navigate(getPropertyDetailPath(property.id))
                  },
                },
              )
            })}
            noValidate
          >
            <div className="create-unit-form__context">
              <span className="create-unit-form__context-label">Property</span>
              <p>{property.name}</p>
            </div>

            <div className="create-unit-form__field">
              <label htmlFor="unit-name">Name</label>
              <input
                id="unit-name"
                type="text"
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={errors.name ? 'true' : 'false'}
                {...register('name')}
              />
              {errors.name?.message ? (
                <p className="create-unit-form__error" role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="create-unit-form__field">
              <label htmlFor="unit-type">Type</label>
              <select
                id="unit-type"
                disabled={isSubmitting}
                aria-invalid={errors.type ? 'true' : 'false'}
                {...register('type')}
              >
                <option value="">Select a unit type</option>
                <option value="room">Room</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="other">Other</option>
              </select>
              {errors.type?.message ? (
                <p className="create-unit-form__error" role="alert">
                  {errors.type.message}
                </p>
              ) : null}
            </div>

            <div className="create-unit-form__field">
              <label htmlFor="unit-notes">Notes</label>
              <textarea
                id="unit-notes"
                rows={4}
                disabled={isSubmitting}
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              />
              {errors.notes?.message ? (
                <p className="create-unit-form__error" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            {currentProfileQuery.isError ? (
              <p className="create-unit-form__error" role="alert">
                We could not confirm your organization. Please try again later.
              </p>
            ) : null}

            {createUnitMutation.isError ? (
              <p className="create-unit-form__error" role="alert">
                We could not create this unit. Please check the details and try
                again.
              </p>
            ) : null}

            <div className="create-unit-form__actions">
              <Link to={getPropertyDetailPath(property.id)}>Cancel</Link>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  currentProfileQuery.isLoading ||
                  organizationId === null
                }
              >
                {isSubmitting ? 'Creating unit...' : 'Create unit'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
