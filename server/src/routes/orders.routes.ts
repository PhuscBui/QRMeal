import { Router } from 'express'
import {
  createOrderGroupController,
  getOrderGroupDetailController,
  getOrdersController,
  payOrdersController,
  updateOrderController,
  updateDeliveryStatusController
} from '~/controllers/orders.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const ordersRouter = Router()

// Create order group (can be dine-in or delivery)
ordersRouter.post('', accessTokenValidator, wrapRequestHandler(createOrderGroupController))

// Get all orders with filtering
ordersRouter.get('', accessTokenValidator, wrapRequestHandler(getOrdersController))

// Get order group detail
ordersRouter.get('/group/:order_group_id', accessTokenValidator, wrapRequestHandler(getOrderGroupDetailController))

// Update individual order
ordersRouter.put('/order/:order_id', accessTokenValidator, wrapRequestHandler(updateOrderController))

// Pay orders for a customer or guest
ordersRouter.post('/pay', accessTokenValidator, wrapRequestHandler(payOrdersController))

// Update delivery status (for delivery orders)
ordersRouter.put('/delivery/:order_group_id', accessTokenValidator, wrapRequestHandler(updateDeliveryStatusController))

export default ordersRouter
