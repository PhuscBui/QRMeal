import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDERS_MESSAGE } from '~/constants/messages'
import { ManagerRoom } from '~/constants/type'
import { TokenPayload } from '~/models/requests/Account.request'
import {
  CreateOrdersReqBody,
  GetOrdersQueryParams,
  OrderParam,
  PayGuestOrdersReqBody,
  UpdateOrderReqBody
} from '~/models/requests/Order.request'
import {
  CreateOrderResponse,
  GetOrdersResponse,
  PayGuestOrdersResponse,
  UpdateOrderResponse
} from '~/models/response/Order.response'
import ordersService from '~/services/orders.service'
import socketService from '~/utils/socket'

export const createOrdersController = async (
  req: Request<ParamsDictionary, CreateOrderResponse, CreateOrdersReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload

  const { socketId, orders } = await ordersService.createOrders(account_id, req.body)

  if (socketId) {
    socketService.getIO().to(ManagerRoom).to(socketId).emit('new-order', orders)
  } else {
    socketService.emitToRoom(ManagerRoom, 'new-order', orders)
  }
  res.status(HTTP_STATUS.CREATED).json({
    message: ORDERS_MESSAGE.ORDER_CREATE_SUCCESS,
    result: orders
  })
}

export const getOrdersController = async (req: Request<GetOrdersQueryParams, GetOrdersResponse>, res: Response) => {
  const orders = await ordersService.getOrders(req.query)

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result: orders
  })
}

export const getOrderDetailController = async (req: Request<OrderParam, GetOrdersResponse>, res: Response) => {
  const order = await ordersService.getOrderDetail(req.params.order_id)

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result: order
  })
}

export const updateOrderController = async (
  req: Request<OrderParam, UpdateOrderResponse, UpdateOrderReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload

  const { socketId, order } = await ordersService.updateOrder(req.params.order_id, {
    ...req.body,
    order_handler_id: account_id
  })

  if (socketId) {
    socketService.getIO().to(ManagerRoom).to(socketId).emit('update-order', order)
  } else {
    console.log('emit to room')
    socketService.emitToRoom(ManagerRoom, 'update-order', order)
  }

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result: order
  })
}

export const payOrdersController = async (
  req: Request<ParamsDictionary, PayGuestOrdersResponse, PayGuestOrdersReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const { socketId, orders } = await ordersService.payOrders(req.body.guestId, account_id)

  if (socketId) {
    socketService.getIO().to(socketId).to(ManagerRoom).emit('payment', orders)
  } else {
    socketService.emitToRoom(ManagerRoom, 'payment', orders)
  }

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_PAY_SUCCESS,
    result: orders
  })
}
