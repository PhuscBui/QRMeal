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
          toDate: queryParams.toDate?.toISOString(),
          order_type: queryParams.order_type,
          customer_id: queryParams.customer_id,
          guest_id: queryParams.guest_id
        })
    ),
  updateOrder: (order_id: string, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${order_id}`, body),
  getOrderDetail: (order_group_id: string) => http.get<GetOrderDetailResType>(`/orders/group/${order_group_id}`),
  pay: (body: PayOrdersBodyType) => http.post<PayOrdersResType>(`/orders/pay`, body),
  updateDelivery: (order_group_id: string, body: UpdateDeliveryStatusBodyType) =>
    http.put<UpdateDeliveryResType>(`/orders/delivery/${order_group_id}`, body),
  
  // New methods for different order types
  createDineInOrder: (body: Omit<CreateOrderGroupBodyType, 'order_type'> & { order_type: 'dine-in' }) =>
    http.post<CreateOrderGroupResType>('/orders', body),
  createTakeawayOrder: (body: Omit<CreateOrderGroupBodyType, 'order_type'> & { order_type: 'takeaway' }) =>
    http.post<CreateOrderGroupResType>('/orders', body),
  createDeliveryOrder: (body: Omit<CreateOrderGroupBodyType, 'order_type'> & { order_type: 'delivery' }) =>
    http.post<CreateOrderGroupResType>('/orders', body),
  
  // Get orders by type
  getDineInOrders: (queryParams?: Omit<GetOrdersQueryParamsType, 'order_type'>) =>
    http.get<GetOrdersResType>('/orders?' + queryString.stringify({ ...queryParams, order_type: 'dine-in' })),
  getTakeawayOrders: (queryParams?: Omit<GetOrdersQueryParamsType, 'order_type'>) =>
    http.get<GetOrdersResType>('/orders?' + queryString.stringify({ ...queryParams, order_type: 'takeaway' })),
  getDeliveryOrders: (queryParams?: Omit<GetOrdersQueryParamsType, 'order_type'>) =>
    http.get<GetOrdersResType>('/orders?' + queryString.stringify({ ...queryParams, order_type: 'delivery' }))
}

export default orderApiRequest
