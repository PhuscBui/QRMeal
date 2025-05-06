import { Router } from 'express'
import {
  createGuestPromotionController,
  deleteGuestPromotionController,
  getGuestPromotionByGuestIdController,
  getGuestPromotionByPhoneController,
  usedPromotionController
} from '~/controllers/guest-promotion.controller'
import { createGuestPromotionValidator, guestIdValidator } from '~/middlewares/guest-promotion.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const guest_promotionRouter = Router()

guest_promotionRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all guest promotions' })
})

guest_promotionRouter.get('/:guestId', guestIdValidator, wrapRequestHandler(getGuestPromotionByGuestIdController))

guest_promotionRouter.get('/phone/:guestPhone', wrapRequestHandler(getGuestPromotionByPhoneController))

guest_promotionRouter.post('/', createGuestPromotionValidator, wrapRequestHandler(createGuestPromotionController))

guest_promotionRouter.post('/used', wrapRequestHandler(usedPromotionController))

guest_promotionRouter.post('/cancel', deleteGuestPromotionController)

export default guest_promotionRouter
