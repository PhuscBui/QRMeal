import { Router } from 'express'
import {
  createOrdersController,
  getOrderDetailController,
  getOrdersController,
  payOrdersController,
  updateOrderController
} from '~/controllers/orders.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const ordersRouter = Router()

ordersRouter.post('', accessTokenValidator, wrapRequestHandler(createOrdersController))
ordersRouter.get('', accessTokenValidator, wrapRequestHandler(getOrdersController))
ordersRouter.get('/:order_id', accessTokenValidator, wrapRequestHandler(getOrderDetailController))
ordersRouter.put('/:order_id', accessTokenValidator, wrapRequestHandler(updateOrderController))
ordersRouter.post('/pay', accessTokenValidator, wrapRequestHandler(payOrdersController))

export default ordersRouter
