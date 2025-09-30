// queries/usePayment.ts
import paymentApiRequest from '@/apiRequests/payment'
import { CreatePaymentLinkBodyType } from '@/schemaValidations/payment.schema'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useCreatePaymentLinkMutation = () => {
  return useMutation({
    mutationFn: (body: CreatePaymentLinkBodyType) => paymentApiRequest.createPaymentLink(body)
  })
}

export const useGetPaymentsByOrderGroupQuery = ({
  order_group_ids,
  enabled = true
}: {
  order_group_ids: string[]
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: ['payments', order_group_ids],
    queryFn: () => paymentApiRequest.getPaymentsByOrderGroup(order_group_ids),
    enabled
  })
}

export const useCheckPaymentStatusQuery = ({
  payment_id,
  enabled = true
}: {
  payment_id: string
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: ['payment-status', payment_id],
    queryFn: () => paymentApiRequest.checkPaymentStatus(payment_id),
    enabled,
    refetchInterval: 5000 // Poll every 5 seconds
  })
}
