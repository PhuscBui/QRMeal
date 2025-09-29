// controllers/orders.controller.ts - Enhanced version
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDERS_MESSAGE } from '~/constants/messages'
import { ManagerRoom, Role } from '~/constants/type'
import { TokenPayload } from '~/models/requests/Account.request'
import {
  CreateOrderGroupReqBody,
  GetOrdersQueryParams,
  OrderGroupParam,
  OrderParam,
  PayOrdersReqBody,
  UpdateOrderReqBody,
  UpdateDeliveryStatusReqBody,
  CreatePaymentLinkReqBody
} from '~/models/requests/Order.request'
import ordersService from '~/services/orders.service'
import paymentsService from '~/services/payments.service'
import socketService from '~/utils/socket'

export const createOrderGroupController = async (
  req: Request<ParamsDictionary, unknown, CreateOrderGroupReqBody>,
  res: Response
) => {
  const { account_id, role } = req.decoded_authorization as TokenPayload

  if (role === Role.Customer) {
    req.body.customer_id = account_id
  }

  const { socketId, orderGroup, orders } = await ordersService.createOrderGroup(account_id, req.body)

  const eventData = { orderGroup, orders }

  if (socketId) {
    socketService.getIO().to(ManagerRoom).to(socketId).emit('new-order', eventData)
  } else {
    socketService.emitToRoom(ManagerRoom, 'new-order', eventData)
  }

  res.status(HTTP_STATUS.CREATED).json({
    message: ORDERS_MESSAGE.ORDER_CREATE_SUCCESS,
    result: eventData
  })
}

export const getOrdersController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetOrdersQueryParams>,
  res: Response
) => {
  const orderGroups = await ordersService.getOrders(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result: orderGroups
  })
}

export const getOrderGroupDetailController = async (req: Request<OrderGroupParam>, res: Response) => {
  const orderGroup = await ordersService.getOrderGroupDetail(req.params.order_group_id)

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result: orderGroup
  })
}

export const updateOrderController = async (req: Request<OrderParam, unknown, UpdateOrderReqBody>, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload

  const { socketId, order } = await ordersService.updateOrder(req.params.order_id, {
    ...req.body,
    order_handler_id: account_id
  })

  if (socketId) {
    socketService.getIO().to(ManagerRoom).to(socketId).emit('update-order', order)
  } else {
    socketService.emitToRoom(ManagerRoom, 'update-order', order)
  }

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_UPDATE_SUCCESS,
    result: order
  })
}

export const payOrdersController = async (req: Request<ParamsDictionary, unknown, PayOrdersReqBody>, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const { customer_id, guest_id, is_customer = false } = req.body

  if (!customer_id && !guest_id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ORDERS_MESSAGE.CUSTOMER_OR_GUEST_REQUIRED
    })
    return
  }

  const customerOrGuestId = customer_id || guest_id!
  const { socketId, orderGroups } = await ordersService.payOrders(customerOrGuestId, account_id, is_customer)

  if (socketId) {
    socketService.getIO().to(socketId).to(ManagerRoom).emit('payment', orderGroups)
  } else {
    socketService.emitToRoom(ManagerRoom, 'payment', orderGroups)
  }

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.ORDER_PAY_SUCCESS,
    result: orderGroups
  })
}

export const updateDeliveryStatusController = async (
  req: Request<OrderGroupParam, unknown, UpdateDeliveryStatusReqBody>,
  res: Response
) => {
  const { delivery_status, shipper_info, estimated_time } = req.body
  const estimatedTimeDate = estimated_time ? new Date(estimated_time) : undefined

  const { socketId, orderGroup } = await ordersService.updateDeliveryStatus(
    req.params.order_group_id,
    delivery_status,
    shipper_info,
    estimatedTimeDate
  )

  if (socketId) {
    socketService.getIO().to(socketId).to(ManagerRoom).emit('delivery-status-update', orderGroup)
  } else {
    socketService.emitToRoom(ManagerRoom, 'delivery-status-update', orderGroup)
  }

  res.status(HTTP_STATUS.OK).json({
    message: ORDERS_MESSAGE.DELIVERY_STATUS_UPDATE_SUCCESS,
    result: orderGroup
  })
}

// Tạo link thanh toán cho order group[]
export const createPaymentLinkController = async (
  req: Request<ParamsDictionary, unknown, CreatePaymentLinkReqBody>,
  res: Response
) => {
  const { order_group_ids, total_amount } = req.body
  const paymentLink = await paymentsService.createPaymentLink(order_group_ids, total_amount)

  res.json({
    message: 'Payment link created successfully',
    result: paymentLink
  })
}

// Lấy thông tin payment link
export const getPaymentLinkController = async (
  req: Request<ParamsDictionary, unknown, unknown, { order_group_ids: string }>,
  res: Response
) => {
  const { order_group_ids } = req.query

  if (!order_group_ids) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Order group IDs are required'
    })
    return
  }

  const orderGroupIdArray = order_group_ids.split(',').map((id) => id.trim())
  const payments = await paymentsService.getPaymentsByOrderGroupIds(orderGroupIdArray)

  res.json({
    message: 'Payment information retrieved',
    result: payments
  })
}

export const checkPaymentStatusController = async (req: Request<{ payment_id: string }>, res: Response) => {
  const { payment_id } = req.params
  const payment = await paymentsService.checkPaymentStatus(payment_id)

  if (!payment) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Payment not found'
    })
    return
  }

  res.json({
    message: 'Payment status retrieved',
    result: payment
  })
}
