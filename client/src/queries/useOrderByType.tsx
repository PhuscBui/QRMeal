import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderApiRequest from '@/apiRequests/order'
import { CreateOrderGroupBodyType, GetOrdersQueryParamsType } from '@/schemaValidations/order.schema'

export const useOrderByTypeQuery = (orderType: 'dine-in' | 'takeaway' | 'delivery', queryParams?: Omit<GetOrdersQueryParamsType, 'order_type'>) => {
  return useQuery({
    queryKey: ['orders', orderType, queryParams],
    queryFn: () => {
      switch (orderType) {
        case 'dine-in':
          return orderApiRequest.getDineInOrders(queryParams)
        case 'takeaway':
          return orderApiRequest.getTakeawayOrders(queryParams)
        case 'delivery':
          return orderApiRequest.getDeliveryOrders(queryParams)
        default:
          return orderApiRequest.getOrderList({ ...queryParams, order_type: orderType })
      }
    },
    enabled: !!orderType
  })
}

export const useCreateOrderByTypeMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (body: CreateOrderGroupBodyType) => {
      switch (body.order_type) {
        case 'dine-in':
          return orderApiRequest.createDineInOrder(body)
        case 'takeaway':
          return orderApiRequest.createTakeawayOrder(body)
        case 'delivery':
          return orderApiRequest.createDeliveryOrder(body)
        default:
          return orderApiRequest.createOrders(body)
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders for the specific type
      queryClient.invalidateQueries({ queryKey: ['orders', variables.order_type] })
      
      // Also invalidate general orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useOrderDetailQuery = (orderGroupId: string) => {
  return useQuery({
    queryKey: ['order-detail', orderGroupId],
    queryFn: () => orderApiRequest.getOrderDetail(orderGroupId),
    enabled: !!orderGroupId
  })
}

export const usePayOrderMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: orderApiRequest.pay,
    onSuccess: () => {
      // Invalidate all order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: any }) => 
      orderApiRequest.updateOrder(orderId, body),
    onSuccess: () => {
      // Invalidate all order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export const useUpdateDeliveryMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderGroupId, body }: { orderGroupId: string; body: any }) => 
      orderApiRequest.updateDelivery(orderGroupId, body),
    onSuccess: () => {
      // Invalidate all order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
