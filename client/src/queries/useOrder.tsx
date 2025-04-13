import orderApiRequest from "@/apiRequests/order";
import {
  GetOrdersQueryParamsType,
  PayGuestOrdersBodyType,
  UpdateOrderBodyType,
} from "@/schemaValidations/order.schema";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({
      order_id,
      ...body
    }: UpdateOrderBodyType & {
      order_id: string;
    }) => orderApiRequest.updateOrder(order_id, body),
  });
};

export const useGetOrderListQuery = (queryParams: GetOrdersQueryParamsType) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderList(queryParams),
    queryKey: ["orders", queryParams],
  });
};

export const useGetOrderDetailQuery = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryFn: () => orderApiRequest.getOrderDetail(id),
    queryKey: ["orders", id],
    enabled,
  });
};

export const usePayForGuestMutation = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.pay(body),
  });
};

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.createOrders,
  });
};
