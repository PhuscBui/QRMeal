import { Router } from 'express'
import {
  createCustomerPromotionController,
  deleteCustomerPromotionController,
  getCustomerPromotionByCustomerIdController,
  usedPromotionController
} from '~/controllers/customer-promotion.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import {
  createCustomerPromotionValidator,
  customerIdValidator,
  usedCustomerPromotionValidator
} from '~/middlewares/customer-promotion.middlewares'

import { wrapRequestHandler } from '~/utils/handlers'

const customer_promotionRouter = Router()

customer_promotionRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all customer promotions' })
})

customer_promotionRouter.get(
  '/:customerId',
  accessTokenValidator,
  customerIdValidator,
  wrapRequestHandler(getCustomerPromotionByCustomerIdController)
)

customer_promotionRouter.post(
  '/',
  accessTokenValidator,
  createCustomerPromotionValidator,
  wrapRequestHandler(createCustomerPromotionController)
)

customer_promotionRouter.post(
  '/used',
  accessTokenValidator,
  usedCustomerPromotionValidator,
  wrapRequestHandler(usedPromotionController)
)

customer_promotionRouter.post('/cancel', accessTokenValidator, wrapRequestHandler(deleteCustomerPromotionController))

export default customer_promotionRouter
