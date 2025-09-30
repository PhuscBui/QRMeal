import http from '@/lib/http'
import {
  CreatePaymentLinkBodyType,
  CreatePaymentLinkResType,
  GetPaymentsResType,
  GetPaymentStatusResType
} from '@/schemaValidations/payment.schema'

const paymentApiRequest = {
  createPaymentLink: (body: CreatePaymentLinkBodyType) =>
    http.post<CreatePaymentLinkResType>('/orders/payment-link', body),

  getPaymentsByOrderGroup: (orderGroupIds: string[]) =>
    http.get<GetPaymentsResType>(`/orders/payment-link?order_group_ids=${orderGroupIds.join(',')}`),

  checkPaymentStatus: (paymentId: string) => http.get<GetPaymentStatusResType>(`/orders/payment-status/${paymentId}`)
}

export default paymentApiRequest
