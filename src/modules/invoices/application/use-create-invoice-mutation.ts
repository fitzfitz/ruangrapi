import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateInvoiceInput } from '../domain/create-invoice-schema'
import {
  createDraftRentInvoice,
  invoicesQueryKey,
} from '../infrastructure/invoices-repository'

type CreateInvoiceMutationVariables = {
  organizationId: string
  input: CreateInvoiceInput
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, input }: CreateInvoiceMutationVariables) =>
      createDraftRentInvoice({
        organization_id: organizationId,
        ...input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey })
    },
  })
}
