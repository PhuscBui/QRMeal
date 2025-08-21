import http from '@/lib/http'
import {
  CreateOrderGroupBodyType,
  CreateOrderGroupResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayOrdersBodyType,
  PayOrdersResType,
  UpdateDeliveryResType,
  UpdateDeliveryStatusBodyType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import queryString from 'query-string'

const orderApiRequest = {
  createOrders: (body: CreateOrderGroupBodyType) => http.post<CreateOrderGroupResType>('/orders', body),
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      '/orders?' +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString()
        })
    ),
  updateOrder: (order_id: string, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${order_id}`, body),
  getOrderDetail: (order_group_id: string) => http.get<GetOrderDetailResType>(`/orders/group/${order_group_id}`),
  pay: (body: PayOrdersBodyType) => http.post<PayOrdersResType>(`/orders/pay`, body),
  updateDelivery: (order_group_id: string, body: UpdateDeliveryStatusBodyType) =>
    http.put<UpdateDeliveryResType>(`/orders/delivery/${order_group_id}`, body)
}

export default orderApiRequest
