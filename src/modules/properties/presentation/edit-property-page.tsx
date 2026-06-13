import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppLayout } from '../../../app/layouts'
import { routePaths } from '../../../app/router/route-paths'
import { usePropertyQuery } from '../application/use-property-query'
import { useUpdatePropertyMutation } from '../application/use-update-property-mutation'
import {
  updatePropertySchema,
  type UpdatePropertyFormValues,
  type UpdatePropertyInput,
} from '../domain/update-property-schema'

function getPropertyDetailPath(propertyId: string) {
  return `${routePaths.dashboardProperties}/${propertyId}`
}

export function EditPropertyPage() {
  const navigate = useNavigate()
  const { propertyId } = useParams<{ propertyId: string }>()
  const propertyQuery = usePropertyQuery(propertyId)
  const updatePropertyMutation = useUpdatePropertyMutation()
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdatePropertyFormValues, unknown, UpdatePropertyInput>({
    resolver: zodResolver(updatePropertySchema),
    defaultValues: {
      name: '',
      address: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (propertyQuery.data === null || propertyQuery.data === undefined) {
      return
    }

    reset({
      name: propertyQuery.data.name,
      address: propertyQuery.data.address ?? '',
      notes: propertyQuery.data.notes ?? '',
    })
  }, [propertyQuery.data, reset])

  const isSubmitting = updatePropertyMutation.isPending
  const propertyDetailPath = propertyId
    ? getPropertyDetailPath(propertyId)
    : routePaths.dashboardProperties

  return (
    <AppLayout>
      <section
        className="edit-property-page"
        aria-labelledby="edit-property-title"
      >
        <div className="edit-property-page__header">
          <div>
            <h2 id="edit-property-title">Edit property</h2>
            <p>
              Update this property's basic details. Units and other rental
              operations are intentionally outside this slice.
            </p>
          </div>
          <Link to={propertyDetailPath}>Back to property</Link>
        </div>

        {!propertyId ? (
          <div className="edit-property-page__empty">
            <h3>Property not found</h3>
            <p>
              This property is missing or is not accessible to your account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isLoading ? (
          <p className="edit-property-page__status">Loading property...</p>
        ) : null}

        {propertyQuery.isError ? (
          <p className="edit-property-page__error" role="alert">
            We could not load this property right now. Please try again later.
          </p>
        ) : null}

        {propertyQuery.isSuccess && propertyQuery.data === null ? (
          <div className="edit-property-page__empty">
            <h3>Property not found</h3>
            <p>
              This property may not exist or may not be accessible to your
              account.
            </p>
          </div>
        ) : null}

        {propertyQuery.isSuccess && propertyQuery.data !== null ? (
          <form
            className="edit-property-form command-form-card"
            onSubmit={handleSubmit((input) => {
              if (!propertyId) {
                return
              }

              updatePropertyMutation.mutate(
                { propertyId, input },
                {
                  onSuccess: (property) => {
                    navigate(getPropertyDetailPath(property.id))
                  },
                },
              )
            })}
            noValidate
          >
            <div className="edit-property-form__field">
              <label htmlFor="property-name">Name</label>
              <input
                id="property-name"
                type="text"
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={errors.name ? 'true' : 'false'}
                {...register('name')}
              />
              {errors.name?.message ? (
                <p className="edit-property-form__error" role="alert">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="edit-property-form__field">
              <label htmlFor="property-address">Address</label>
              <textarea
                id="property-address"
                rows={3}
                disabled={isSubmitting}
                aria-invalid={errors.address ? 'true' : 'false'}
                {...register('address')}
              />
              {errors.address?.message ? (
                <p className="edit-property-form__error" role="alert">
                  {errors.address.message}
                </p>
              ) : null}
            </div>

            <div className="edit-property-form__field">
              <label htmlFor="property-notes">Notes</label>
              <textarea
                id="property-notes"
                rows={4}
                disabled={isSubmitting}
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              />
              {errors.notes?.message ? (
                <p className="edit-property-form__error" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            {updatePropertyMutation.isError ? (
              <p className="edit-property-form__error" role="alert">
                We could not update this property. Please check the details and
                try again.
              </p>
            ) : null}

            <div className="edit-property-form__actions">
              <Link to={propertyDetailPath}>Cancel</Link>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving property...' : 'Save property'}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </AppLayout>
  )
}
