import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { usePropertyQuery } from '../../properties/application/use-property-query'
import { useUnitQuery } from '../application/use-unit-query'
import { useUpdateUnitMutation } from '../application/use-update-unit-mutation'
import {
  updateUnitSchema,
  type UpdateUnitFormValues,
  type UpdateUnitInput,
} from '../domain/update-unit-schema'

function getPropertyDetailPath(propertyId: string) {
  return `${routePaths.dashboardProperties}/${propertyId}`
}

export function EditUnitPage() {
  const navigate = useNavigate()
  const { propertyId, unitId } = useParams<{
    propertyId: string
    unitId: string
  }>()
  const propertyQuery = usePropertyQuery(propertyId)
  const unitQuery = useUnitQuery(propertyId, unitId)
  const updateUnitMutation = useUpdateUnitMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdateUnitFormValues, unknown, UpdateUnitInput>({
    resolver: zodResolver(updateUnitSchema),
    defaultValues: {
      name: '',
      type: 'room',
      notes: '',
    },
  })

  useEffect(() => {
    if (unitQuery.data === null || unitQuery.data === undefined) {
      return
    }

    reset({
      name: unitQuery.data.name,
      type: unitQuery.data.type,
      notes: unitQuery.data.notes ?? '',
    })
  }, [reset, unitQuery.data])

  const propertyDetailPath = propertyId
    ? getPropertyDetailPath(propertyId)
    : routePaths.dashboardProperties
  const property = propertyQuery.data ?? null
  const unit = unitQuery.data ?? null
  const isSubmitting = updateUnitMutation.isPending
  const isLoadingContext = propertyQuery.isLoading || unitQuery.isLoading

  return (
    <AppLayout>
      <section className="edit-unit-page" aria-labelledby="edit-unit-title">
        <div className="edit-unit-page__header">
          <div>
            <h2 id="edit-unit-title">Edit unit</h2>
            <p>
              Update this unit's basic details within the selected property.
              Occupancy, rent, tenant, and lease workflows stay deferred.
            </p>
          </div>
          <Link to={propertyDetailPath}>Back to property</Link>
        </div>

        {!propertyId ? (
          <div className="edit-unit-page__empty">
            <h3>Property not found</h3>
            <p>This unit needs a property before it can be edited.</p>
          </div>
        ) : null}

        {!unitId ? (
          <div className="edit-unit-page__empty">
            <h3>Unit not found</h3>
            <p>This edit page needs a unit before it can be loaded.</p>
          </div>
        ) : null}

        {isLoadingContext ? (
          <p className="edit-unit-page__status">Loading unit...</p>
        ) : null}

        {propertyQuery.isError ? (
          <p className="edit-unit-page__error" role="alert">
            We could not load this property right now. Please try again later.
          </p>
        ) : null}

        {unitQuery.isError ? (
          <p className="edit-unit-page__error" role="alert">
            We could not load this unit right now. Please try again later.
          </p>
        ) : null}

        {propertyQuery.isSuccess && property === null ? (
          <div className="edit-unit-page__empty">
            <h3>Property not found</h3>
            <p>
              This property may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {unitQuery.isSuccess && unit === null ? (
          <div className="edit-unit-page__empty">
            <h3>Unit not found</h3>
            <p>
              This unit may not exist, may belong to a different property, or
              may not be accessible to your account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isSuccess &&
        property !== null &&
        unitQuery.isSuccess &&
        unit !== null ? (
          <form
            className="edit-unit-form"
            onSubmit={handleSubmit((input) => {
              updateUnitMutation.mutate(
                {
                  propertyId: property.id,
                  unitId: unit.id,
                  input,
                },
                {
                  onSuccess: (updatedUnit) => {
                    navigate(getPropertyDetailPath(updatedUnit.property_id))
                  },
                },
              )
            })}
            noValidate
          >
            <div className="edit-unit-form__context">
              <span className="edit-unit-form__context-label">Property</span>
              <p>{property.name}</p>
            </div>

            <div className="edit-unit-form__field">
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
                <p className="edit-unit-form__error" role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="edit-unit-form__field">
              <label htmlFor="unit-type">Type</label>
              <select
                id="unit-type"
                disabled={isSubmitting}
                aria-invalid={errors.type ? 'true' : 'false'}
                {...register('type')}
              >
                <option value="room">Room</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="other">Other</option>
              </select>
              {errors.type?.message ? (
                <p className="edit-unit-form__error" role="alert">
                  {errors.type.message}
                </p>
              ) : null}
            </div>

            <div className="edit-unit-form__field">
              <label htmlFor="unit-notes">Notes</label>
              <textarea
                id="unit-notes"
                rows={4}
                disabled={isSubmitting}
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              />
              {errors.notes?.message ? (
                <p className="edit-unit-form__error" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            {updateUnitMutation.isError ? (
              <p className="edit-unit-form__error" role="alert">
                We could not update this unit. Please check the details and try
                again.
              </p>
            ) : null}

            <div className="edit-unit-form__actions">
              <Link to={propertyDetailPath}>Cancel</Link>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving unit...' : 'Save unit'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
