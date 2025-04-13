import http from "@/lib/http";
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import queryString from "query-string";

const orderApiRequest = {
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>("/orders", body),
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      "/orders?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    ),
  updateOrder: (order_id: string, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${order_id}`, body),
  getOrderDetail: (orderId: string) =>
    http.get<GetOrderDetailResType>(`/orders/${orderId}`),
  pay: (body: PayGuestOrdersBodyType) =>
    http.post<PayGuestOrdersResType>(`/orders/pay`, body),
};

export default orderApiRequest;
