import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  invoicesQueryKey,
  issueInvoice,
} from '../infrastructure/invoices-repository'

type IssueInvoiceMutationVariables = {
  invoiceId: string
  organizationId: string
  dueDate: string
}

export function useIssueInvoiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invoiceId,
      organizationId,
      dueDate,
    }: IssueInvoiceMutationVariables) =>
      issueInvoice({
        invoice_id: invoiceId,
        organization_id: organizationId,
        due_date: dueDate,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey })
    },
  })
}
