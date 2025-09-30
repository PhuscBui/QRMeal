import { Router } from 'express'
import {
  createOrderGroupController,
  getOrderGroupDetailController,
  getOrdersController,
  payOrdersController,
  updateOrderController,
  updateDeliveryStatusController,
  createPaymentLinkController,
  getPaymentLinkController,
  checkPaymentStatusController
} from '~/controllers/orders.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import {
  checkOrderOwnership,
  createPaymentLinkValidator,
  orderGroupIdsQueryValidator,
  paymentIdValidator
} from '~/middlewares/payment.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const ordersRouter = Router()

// Create order group (can be dine-in or delivery)
ordersRouter.post('', accessTokenValidator, wrapRequestHandler(createOrderGroupController))

// Get all orders with filtering
ordersRouter.get('', accessTokenValidator, wrapRequestHandler(getOrdersController))

// Get order group detail
ordersRouter.get('/group/:order_group_id', accessTokenValidator, wrapRequestHandler(getOrderGroupDetailController))

// Update individual order
ordersRouter.put('/:order_id', accessTokenValidator, wrapRequestHandler(updateOrderController))

// Pay orders for a customer or guest
ordersRouter.post('/pay', accessTokenValidator, wrapRequestHandler(payOrdersController))

// Update delivery status (for delivery orders)
ordersRouter.put('/delivery/:order_group_id', accessTokenValidator, wrapRequestHandler(updateDeliveryStatusController))

// Payment routes with validation middleware
ordersRouter.post(
  '/payment-link',
  accessTokenValidator,
  createPaymentLinkValidator,
  checkOrderOwnership,
  wrapRequestHandler(createPaymentLinkController)
)
ordersRouter.get(
  '/payment-link',
  accessTokenValidator,
  orderGroupIdsQueryValidator,
  checkOrderOwnership,
  wrapRequestHandler(getPaymentLinkController)
)
ordersRouter.get(
  '/payment-status/:payment_id',
  accessTokenValidator,
  paymentIdValidator,
  wrapRequestHandler(checkPaymentStatusController)
)

export default ordersRouter
